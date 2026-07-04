# -*- coding: utf-8 -*-
# Interim film sequence from life1.mp4 continuous segments + dip-to-black beat transitions
import cv2, os, glob

os.chdir(os.path.dirname(os.path.abspath(__file__)))
OUT = "assets/seq"
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(OUT + "/f*.jpg"):
    os.remove(f)

SEGS = [(22, 54), (80, 105), (187, 210), (214, 240)]  # inclusive, continuous shots
W = 960  # output width (9:16 -> 960x1706)

cap = cv2.VideoCapture("assets/life1.mp4")
frames = []
for (a, b) in SEGS:
    seg = []
    for fi in range(a, b + 1):
        cap.set(cv2.CAP_PROP_POS_FRAMES, fi)
        ok, fr = cap.read()
        if not ok:
            continue
        h, w = fr.shape[:2]
        fr = cv2.resize(fr, (W, round(h * W / w)), interpolation=cv2.INTER_AREA)
        seg.append(fr)
    frames.append(seg)
cap.release()

# dip-to-black: darken tail/head frames around each boundary (0.18 at the cut, 0.55 beside it)
DIP = [0.18, 0.55]
seq = []
for si, seg in enumerate(frames):
    seg = list(seg)
    if si < len(frames) - 1:                      # tail: last frame darkest
        for k, m in enumerate(DIP):
            idx = len(seg) - 1 - k
            if 0 <= idx < len(seg):
                seg[idx] = (seg[idx] * m).astype("uint8")
    if si > 0:                                    # head: first frame darkest
        for k, m in enumerate(DIP):
            if k < len(seg):
                seg[k] = (seg[k] * m).astype("uint8")
    seq.extend(seg)

idx = 0
for fr in seq:
    cv2.imwrite(f"{OUT}/f{idx:03d}.jpg", fr, [cv2.IMWRITE_JPEG_QUALITY, 80])
    idx += 1
print("FRAME_COUNT =", idx)

# boundaries as progress (for caption windows)
tot = idx
acc = 0
for si, (a, b) in enumerate(SEGS[:-1]):
    acc += (b - a + 1)
    print(f"boundary {si+1}: frame {acc} -> progress {acc/tot:.3f}")

# ritual.jpg: frame 199 cropped to 16:9 around the crown moment
cap = cv2.VideoCapture("assets/life1.mp4")
cap.set(cv2.CAP_PROP_POS_FRAMES, 199)
ok, fr = cap.read()
cap.release()
if ok:
    H, Wf = fr.shape[:2]  # 1920x1080
    ch = round(Wf * 9 / 16)  # 607
    cy = round(H * 0.52) - ch // 2
    cy = max(0, min(H - ch, cy))
    crop = fr[cy:cy + ch, :]
    cv2.imwrite("assets/ritual.jpg", crop, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print("ritual.jpg", crop.shape[:2])

sz = sum(os.path.getsize(f) for f in glob.glob(OUT + "/f*.jpg"))
print("seq size MB:", round(sz / 1e6, 2))
