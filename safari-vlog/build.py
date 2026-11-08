"""Builds the safari vlog from the EDL with ffmpeg.

Usage: python3 build.py RAW_DIR MUSIC_DIR WORK_DIR OUT_FILE
"""
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

from edl import SECTIONS

RAW, MUSIC, WORK, OUT = sys.argv[1:5]
XF = 0.6  # crossfade between sections, seconds
AMBIENCE = 0.18  # camera audio level under the music
MUSIC_GAIN = 0.85

os.makedirs(WORK, exist_ok=True)


def run(cmd):
    subprocess.run(cmd, check=True)


def shot_path(si, k):
    return os.path.join(WORK, f"s{si:02d}_{k:02d}.mp4")


def render_shot(args):
    si, k, (clip, start, dur) = args
    out = shot_path(si, k)
    if os.path.exists(out):
        return
    fade = 0.12
    run([
        "ffmpeg", "-v", "error", "-y", "-ss", str(start), "-t", str(dur), "-i", os.path.join(RAW, clip + ".MOV"),
        "-vf", "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,setsar=1,format=yuv420p",
        "-af", f"aresample=48000,aformat=channel_layouts=stereo,volume={AMBIENCE},"
               f"afade=t=in:d={fade},afade=t=out:st={dur - fade}:d={fade}",
        "-t", str(dur), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "aac", "-b:a", "192k",
        out + ".tmp.mp4",
    ])
    os.rename(out + ".tmp.mp4", out)


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
    sec_durs.append(float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).strip()))

# Crossfades between sections.
inputs, vf, af = [], [], []
for f in sec_files:
    inputs += ["-i", f]
starts = [0.0]
vprev, aprev, acc = "[0:v]", "[0:a]", sec_durs[0]
for i in range(1, len(sec_files)):
    off = acc - XF
    starts.append(off)
    vf.append(f"{vprev}[{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[v{i}]")
    af.append(f"{aprev}[{i}:a]acrossfade=d={XF}[a{i}]")
    vprev, aprev = f"[v{i}]", f"[a{i}]"
    acc = off + sec_durs[i]
total = acc

# Music bed: consecutive sections on the same track play it continuously.
runs = []
for i, (_, track, _) in enumerate(SECTIONS):
    end = starts[i] + sec_durs[i]
    if runs and runs[-1][0] == track:
        runs[-1][2] = end
    else:
        runs.append([track, starts[i], end])
mf = []
for j, (track, s, e) in enumerate(runs):
    inputs += ["-i", os.path.join(MUSIC, track)]
    idx = len(sec_files) + j
    length = e - s + (1.2 if j < len(runs) - 1 else 0)
    ms = int(s * 1000)
    mf.append(
        f"[{idx}:a]atrim=0:{length:.3f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,"
        f"afade=t=in:d=1.2,afade=t=out:st={length - 1.8:.3f}:d=1.8,volume={MUSIC_GAIN},adelay={ms}|{ms}[m{j}]")
music_mix = "".join(f"[m{j}]" for j in range(len(runs))) + f"amix=inputs={len(runs)}:normalize=0[mus]"

fc = ";".join(vf + af + mf + [
    music_mix,
    f"{vprev}fade=t=in:d=1,fade=t=out:st={total - 1.5:.3f}:d=1.5[vout]",
    f"{aprev}[mus]amix=inputs=2:normalize=0,afade=t=out:st={total - 1.5:.3f}:d=1.5,loudnorm=I=-14:TP=-1.5:LRA=11[aout]",
])
run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
     "-t", f"{total:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
     "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT])
print(f"done {total:.1f}s, music runs: " + ", ".join(f"{t} {s:.0f}-{e:.0f}s" for t, s, e in runs))
