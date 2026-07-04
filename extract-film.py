# -*- coding: utf-8 -*-
# Final film extraction (kit memory/06): 24/clip, drop duplicate boundary frames,
# rebuild assets/seq and auto-patch FRAME_COUNT + caption windows stay as-is (4 beats).
import cv2, os, glob, re
import numpy as np

os.chdir(os.path.dirname(os.path.abspath(__file__)))
# (path, end_frame or None, dip_before: darken this clip's first frames + prev clip's last frames)
clips = [
    ("gen/videos/v1.mp4", None, False),
    ("gen/videos/v2.mp4", None, True),   # v1 end has spatula, v2 start doesn't -> beat dip
    ("gen/videos/v3.mp4", 87, False),    # trim before the crown lands (v4 replays the landing)
    ("assets/v4.mp4", None, False),
]
out = "assets/seq"
os.makedirs(out, exist_ok=True)
for f in glob.glob(out + "/f*.jpg"):
    os.remove(f)

PER, W = 24, 1280
segs = []
for ci, (p, end, dip) in enumerate(clips):
    cap = cv2.VideoCapture(p)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    if total <= 0:
        print("WARN empty", p); cap.release(); continue
    last = min(end, total - 1) if end else total - 1
    n = PER if not end else max(2, round(PER * last / (total - 1)))
    picks = [round(i * last / (n - 1)) for i in range(n)]
    if ci > 0:
        picks = picks[1:]  # drop duplicate boundary frame
    frames = []
    for fr_i in picks:
        cap.set(cv2.CAP_PROP_POS_FRAMES, fr_i)
        ok, fr = cap.read()
        if not ok:
            continue
        h, w = fr.shape[:2]
        frames.append(cv2.resize(fr, (W, round(h * W / w)), interpolation=cv2.INTER_AREA))
    cap.release()
    segs.append((frames, dip))

# apply dip-to-black at flagged boundaries (mask residual start/end drift as a beat)
DIP = [0.16, 0.5]
for si, (frames, dip) in enumerate(segs):
    if dip and si > 0:
        prev = segs[si - 1][0]
        for k, m in enumerate(DIP):
            if k < len(prev):
                prev[len(prev) - 1 - k] = (prev[len(prev) - 1 - k] * m).astype(np.uint8)
            if k < len(frames):
                frames[k] = (frames[k] * m).astype(np.uint8)

idx = 0
for frames, _ in segs:
    for fr in frames:
        cv2.imwrite(f"{out}/f{idx:03d}.jpg", fr, [cv2.IMWRITE_JPEG_QUALITY, 80])
        idx += 1
print("FRAME_COUNT =", idx)
acc = 0
for frames, _ in segs[:-1]:
    acc += len(frames)
    print(f"boundary at frame {acc} -> progress {acc/idx:.3f}")

# auto-patch index.html: FRAME_COUNT, FOCUS_Y back to center (16:9 frames), caption windows to quarters
html = open("index.html", encoding="utf-8").read()
html = re.sub(r"const FRAME_COUNT=\d+;", f"const FRAME_COUNT={idx};", html)
html = re.sub(r"const FOCUS_Y=[0-9.]+;", "const FOCUS_Y=0.5;", html)
caps = [(0.03, 0.22), (0.31, 0.48), (0.56, 0.71), (0.79, 0.98)]
n = [0]
def rep(m):
    a, b = caps[n[0]]; n[0] += 1
    return f'{m.group(1)}{a}{m.group(2)}{b}{m.group(3)}'
html = re.sub(r'(<div class="cap" data-a=")[0-9.]+(" data-b=")[0-9.]+(">)', rep, html, count=4)
open("index.html", "w", encoding="utf-8").write(html)
print("index.html patched")

sz = sum(os.path.getsize(f) for f in glob.glob(out + "/f*.jpg"))
print("seq size MB:", round(sz / 1e6, 2))
