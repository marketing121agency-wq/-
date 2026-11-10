"""China street edit: pauses cut, showing moments kept, B-roll from the second clip laid over the talk.

Usage: python3 build.py MAIN.mov BROLL.mov OUT.mp4
"""
import os
import subprocess
import sys

MAIN, BROLL, OUT = sys.argv[1:4]

# Kept pieces, in order: (input, start, end, zoom). Input 0 is the main talk, 1 is the second clip.
# The yellow-shirt sample giver (0-8.6) and the shop queue (45.5-51) are showing moments and stay in.
SEGMENTS = [
    (0, 0.00, 8.60, 1.00),
    (0, 9.20, 17.65, 1.08),  # pause 8.6-9.2 cut while he turns the camera round
    (0, 18.05, 52.70, 1.00),  # pause 17.65-18.05 cut
    (0, 53.15, 55.45, 1.08),  # pause 52.7-53.15 cut; ends before the camera whips away
    (1, 19.70, 21.80, 1.00),  # closing line in front of the shop
]

# Hook at the very start: the "25-30% conversion, but the halva is great" line over the shop queue
# and a sample in the hand, with an on-screen question. (input, start, end) for picture; audio is MAIN.
HOOK_AUDIO = (42.30, 45.45)
HOOK_PICTURE = [(0, 47.00, 48.60), (1, 10.40, 11.95)]
HOOK_TEXT = ["Nega bu do‘kon oldida", "doim navbat?"]
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "motion-promo", "public", "fonts", "inter-full.ttf")
HOOK_LEN = HOOK_AUDIO[1] - HOOK_AUDIO[0]

# B-roll from the second clip over the talk, keyed by MAIN-clip time: (main_from, main_to, broll_from).
OVERLAYS = [
    (10.50, 14.00, 4.60),   # giving out free samples
    (15.20, 16.60, 10.40),  # the sample in his hand
    (25.00, 28.00, 0.00),   # samples being cut on the plate
    (39.00, 44.50, 13.00),  # inside the shop
]


def out_time(src_t):
    acc = HOOK_LEN
    for inp, a, b, _ in SEGMENTS:
        if inp == 0 and a <= src_t <= b:
            return acc + src_t - a
        acc += b - a
    raise ValueError(src_t)


FIT = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1"
SRC = [MAIN, BROLL]
WORK = OUT + ".parts"
os.makedirs(WORK, exist_ok=True)


def cut(src, a, b, path, extra="", audio=True):
    # One 4K decode at a time keeps memory low.
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-t", f"{b - a:.3f}", "-i", src, "-vf", FIT + extra]
    if audio:
        cmd += ["-af", f"aresample=48000,afade=t=in:d=0.03,afade=t=out:st={b - a - 0.03:.3f}:d=0.03",
                "-c:a", "pcm_s16le"]
    else:
        cmd += ["-an"]
    subprocess.run(cmd + ["-c:v", "libx264", "-preset", "fast", "-crf", "16", "-pix_fmt", "yuv420p", path], check=True)


# Hook: picture pieces, joined, with the question drawn on top and the line from MAIN underneath.
hook_parts = []
for k, (inp, a, b) in enumerate(HOOK_PICTURE):
    path = os.path.join(WORK, f"hook{k}.mov")
    cut(SRC[inp], a, b, path, audio=False)
    hook_parts.append(path)
hook_audio = os.path.join(WORK, "hook_a.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(HOOK_AUDIO[0]), "-t", f"{HOOK_LEN:.3f}", "-i", MAIN, "-vn",
                "-af", f"aresample=48000,afade=t=in:d=0.03,afade=t=out:st={HOOK_LEN - 0.08:.3f}:d=0.08",
                "-c:a", "pcm_s16le", hook_audio], check=True)
box = "box=1:boxcolor=black@0.55:boxborderw=26"
draw = ",".join(
    f"drawtext=fontfile='{FONT}':text='{line}':fontsize=84:fontcolor=white:{box}:x=(w-tw)/2:y=h*0.16+{i * 132}:"
    f"alpha='min(1,t/0.25)'" for i, line in enumerate(HOOK_TEXT))
hook = os.path.join(WORK, "hook.mov")
hin = []
for f in hook_parts:
    hin += ["-i", f]
subprocess.run(["ffmpeg", "-v", "error", "-y", *hin, "-i", hook_audio, "-filter_complex",
                "".join(f"[{k}:v]" for k in range(len(hook_parts))) + f"concat=n={len(hook_parts)}:v=1:a=0,{draw}[v]",
                "-map", "[v]", "-map", f"{len(hook_parts)}:a", "-t", f"{HOOK_LEN:.3f}", "-c:v", "libx264",
                "-preset", "fast", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", hook], check=True)

seg_files = [hook]
for i, (inp, a, b, zoom) in enumerate(SEGMENTS):
    z = f",scale=iw*{zoom}:ih*{zoom},crop=1080:1920,setsar=1" if zoom != 1 else ""
    path = os.path.join(WORK, f"seg{i}.mov")
    cut(SRC[inp], a, b, path, z)
    seg_files.append(path)
ov_files = []
for j, (s0, s1, b0) in enumerate(OVERLAYS):
    path = os.path.join(WORK, f"ov{j}.mov")
    cut(BROLL, b0, b0 + s1 - s0, path, audio=False)
    ov_files.append(path)

inputs, parts = [], []
for f in seg_files + ov_files:
    inputs += ["-i", f]
n = len(seg_files)
parts.append("".join(f"[{i}:v][{i}:a]" for i in range(n)) + f"concat=n={n}:v=1:a=1[base][aout]")
prev = "[base]"
for j, (s0, s1, _) in enumerate(OVERLAYS):
    t0, t1 = out_time(s0), out_time(s1)
    parts.append(f"[{n + j}:v]setpts=PTS-STARTPTS+{t0:.3f}/TB[o{j}]")
    parts.append(f"{prev}[o{j}]overlay=enable='between(t,{t0:.3f},{t1:.3f})':eof_action=pass[b{j}]")
    prev = f"[b{j}]"
parts.append(f"{prev}null[vout]")

subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(parts),
                "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
                "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT], check=True)
print("overlays at", [(round(out_time(a), 2), round(out_time(b), 2)) for a, b, _ in OVERLAYS])
