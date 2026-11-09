"""Builds the safari vlog from the EDL with ffmpeg.

Usage: python3 build.py RAW_DIR MUSIC_DIR WORK_DIR VAD_MODEL FONT_DIR OUT_FILE
"""
import os
import subprocess
import sys
import wave
from concurrent.futures import ThreadPoolExecutor

import numpy as np

from edl import SECTIONS, TITLE

RAW, MUSIC, WORK, VAD_MODEL, FONTS, OUT = sys.argv[1:7]
XF = 0.6  # crossfade between sections, seconds
AMB_LOW, AMB_HIGH = 0.2, 1.0  # camera sound: under music / when it matters
MUSIC_GAIN, MUSIC_DUCKED = 0.85, 0.22
RAMP = 0.35  # seconds to fade the ducking in and out

os.makedirs(WORK, exist_ok=True)


def run(cmd):
    subprocess.run(cmd, check=True)


def shot_path(si, k):
    return os.path.join(WORK, f"s{si:02d}_{k:02d}.mp4")


def render_shot(args):
    si, k, (clip, start, dur, *_) = args
    out = shot_path(si, k)
    if os.path.exists(out):
        return
    fade = 0.12
    run([
        "ffmpeg", "-v", "error", "-y", "-ss", str(start), "-t", str(dur), "-i", os.path.join(RAW, clip + ".MOV"),
        "-vf", "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,setsar=1,format=yuv420p",
        "-af", f"aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d={fade},afade=t=out:st={dur - fade}:d={fade}",
        "-t", str(dur), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "aac", "-b:a", "192k",
        out + ".tmp.mp4",
    ])
    os.rename(out + ".tmp.mp4", out)


def duration(path):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).strip())


jobs = [(si, k, shot) for si, (_, _, shots) in enumerate(SECTIONS) for k, shot in enumerate(shots)]
with ThreadPoolExecutor(3) as ex:
    list(ex.map(render_shot, jobs))

# Hard cuts inside each section.
sec_files, sec_durs = [], []
for si, (_, _, shots) in enumerate(SECTIONS):
    lst = os.path.join(WORK, f"sec{si:02d}.txt")
    with open(lst, "w") as f:
        for k in range(len(shots)):
            f.write(f"file '{shot_path(si, k)}'\n")
    out = os.path.join(WORK, f"sec{si:02d}.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out])
    sec_files.append(out)
    sec_durs.append(duration(out))

# Timeline: section starts after crossfades, and the span of every "focus" shot.
starts, acc = [0.0], sec_durs[0]
for i in range(1, len(sec_files)):
    starts.append(acc - XF)
    acc = starts[-1] + sec_durs[i]
total = acc
focus = []
for si, (_, _, shots) in enumerate(SECTIONS):
    t = starts[si]
    for k, shot in enumerate(shots):
        d = duration(shot_path(si, k))
        if len(shot) > 3 and shot[3] == "focus":
            focus.append((t, t + d))
        t += d

# Pass A: crossfaded picture (with title and fades) and full-level camera sound.
inputs = []
for f in sec_files:
    inputs += ["-i", f]
vf, af = [], []
vprev, aprev = "[0:v]", "[0:a]"
for i in range(1, len(sec_files)):
    vf.append(f"{vprev}[{i}:v]xfade=transition=fade:duration={XF}:offset={starts[i]:.3f}[v{i}]")
    af.append(f"{aprev}[{i}:a]acrossfade=d={XF}[a{i}]")
    vprev, aprev = f"[v{i}]", f"[a{i}]"


def title_alpha(a, b):
    return f"if(lt(t,{a}),0,if(lt(t,{a}+0.8),(t-{a})/0.8,if(lt(t,{b}-0.8),1,if(lt(t,{b}),({b}-t)/0.8,0))))"


tall = os.path.join(FONTS, "oswald-full.ttf")
sans = os.path.join(FONTS, "inter-full.ttf")
shadow = "shadowcolor=black@0.55:shadowx=0:shadowy=4"
title = ",".join([
    f"drawtext=fontfile='{tall}':text='{TITLE[0]}':fontsize=190:fontcolor=white:{shadow}:x=(w-tw)/2:y=h*0.36:alpha='{title_alpha(0.5, 6.4)}'",
    f"drawtext=fontfile='{sans}':text='{TITLE[1]}':fontsize=72:fontcolor=white:{shadow}:x=(w-tw)/2:y=h*0.36+215:alpha='{title_alpha(1.1, 6.4)}'",
    f"drawtext=fontfile='{sans}':text='{TITLE[2]}':fontsize=40:fontcolor=white@0.85:{shadow}:x=(w-tw)/2:y=h*0.36+315:alpha='{title_alpha(1.6, 6.4)}'",
])
picture = os.path.join(WORK, "pass_a.mp4")
fc = ";".join(vf + af + [f"{vprev}{title},fade=t=in:d=1,fade=t=out:st={total - 1.5:.3f}:d=1.5[vout]",
                         f"{aprev}anull[aout]"])
run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
     "-t", f"{total:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
     "-c:a", "pcm_s16le", picture.replace(".mp4", ".mov")])
picture = picture.replace(".mp4", ".mov")

# Pass B: find speech in the camera sound.
speech_wav = os.path.join(WORK, "speech16k.wav")
run(["ffmpeg", "-v", "error", "-y", "-i", picture, "-ac", "1", "-ar", "16000", speech_wav])
import sherpa_onnx  # noqa: E402

cfg = sherpa_onnx.VadModelConfig()
cfg.silero_vad.model = VAD_MODEL
cfg.silero_vad.min_silence_duration = 0.6
cfg.silero_vad.min_speech_duration = 0.5
cfg.silero_vad.threshold = 0.6
cfg.sample_rate = 16000
vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=total + 10)
with wave.open(speech_wav) as w:
    samples = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
win = cfg.silero_vad.window_size
speech = []
for i in range(0, len(samples) - win, win):
    vad.accept_waveform(samples[i:i + win])
    while not vad.empty():
        seg = vad.front
        speech.append((seg.start / 16000, (seg.start + len(seg.samples)) / 16000))
        vad.pop()
vad.flush()
while not vad.empty():
    seg = vad.front
    speech.append((seg.start / 16000, (seg.start + len(seg.samples)) / 16000))
    vad.pop()

# Merge speech and focus spans that are close together.
spans = sorted(speech + focus)
merged = []
for a, b in spans:
    if merged and a - merged[-1][1] < 1.2:
        merged[-1][1] = max(merged[-1][1], b)
    else:
        merged.append([a, b])
ramp_terms = "+".join(
    f"clip((t-{a - RAMP:.2f})/{RAMP},0,1)*clip(({b + RAMP:.2f}-t)/{RAMP},0,1)" for a, b in merged) or "0"
duck = f"min(1,{ramp_terms})"

# Pass C: music bed (one track per run of sections), ducked under speech and focus shots.
runs = []
for i, (_, track, _) in enumerate(SECTIONS):
    end = starts[i] + sec_durs[i]
    if runs and runs[-1][0] == track:
        runs[-1][2] = end
    else:
        runs.append([track, starts[i], end])
inputs = ["-i", picture]
mf = []
for j, (track, s, e) in enumerate(runs):
    inputs += ["-stream_loop", "-1", "-i", os.path.join(MUSIC, track)]
    length = e - s + (1.2 if j < len(runs) - 1 else 0)
    ms = int(s * 1000)
    mf.append(
        f"[{j + 1}:a]atrim=0:{length:.3f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,"
        f"afade=t=in:d=1.2,afade=t=out:st={length - 1.8:.3f}:d=1.8,adelay={ms}|{ms}[m{j}]")
fc = ";".join(mf + [
    "".join(f"[m{j}]" for j in range(len(runs))) + f"amix=inputs={len(runs)}:normalize=0,"
    f"volume='{MUSIC_GAIN}-({MUSIC_GAIN}-{MUSIC_DUCKED})*{duck}':eval=frame[mus]",
    f"[0:a]volume='{AMB_LOW}+({AMB_HIGH}-{AMB_LOW})*{duck}':eval=frame[amb]",
    f"[amb][mus]amix=inputs=2:normalize=0,afade=t=out:st={total - 1.5:.3f}:d=1.5,"
    "loudnorm=I=-14:TP=-1.5:LRA=11[aout]",
])
script = os.path.join(WORK, "mix.txt")
with open(script, "w") as f:
    f.write(fc)
run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex_script", script, "-map", "0:v", "-map", "[aout]",
     "-t", f"{total:.3f}", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT])

with open(os.path.join(WORK, "ducking.txt"), "w") as f:
    for a, b in merged:
        f.write(f"{a:8.2f} {b:8.2f}\n")
print(f"done {total:.1f}s; {len(speech)} speech spans, {len(focus)} focus shots, {len(merged)} ducked spans")
print("music runs: " + ", ".join(f"{t} {s:.0f}-{e:.0f}s" for t, s, e in runs))
