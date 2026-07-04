# -*- coding: utf-8 -*-
# Interim asset prep: optimize master, extract video frame candidates, crop editions
import cv2, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("gen/candidates", exist_ok=True)

def save(img, path, w=2000, q=87):
    h0, w0 = img.shape[:2]
    if w0 > w:
        img = cv2.resize(img, (w, round(h0 * w / w0)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, q])
    print("saved", path, img.shape[:2])

# 1) product-hero.jpg from master ref (1:1 2048)
m = cv2.imread("refs/ref-smash-product.jpg")
save(m, "assets/product-hero.jpg", w=1800, q=88)

# 2) candidate frames from life1.mp4 (10s macro commercial) + cta.mp4 (8s orbit)
for name, path, n in [("life", "assets/life1.mp4", 12), ("cta", "assets/cta.mp4", 8)]:
    cap = cv2.VideoCapture(path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    print(name, "frames:", total)
    for i in range(n):
        fi = round(i * (total - 1) / (n - 1))
        cap.set(cv2.CAP_PROP_POS_FRAMES, fi)
        ok, fr = cap.read()
        if ok:
            cv2.imwrite(f"gen/candidates/{name}-{i:02d}-f{fi}.jpg", fr, [cv2.IMWRITE_JPEG_QUALITY, 85])
    cap.release()

# 3) edition-1.jpg: crop hashi 9:16 (768x1376) to 4:3 around the burger (center-lower)
h1 = cv2.imread("refs/ref-hashi.png")
H, W = h1.shape[:2]  # 1376, 768
cw = W                       # full width
ch = round(cw * 3 / 4)       # 4:3 -> 576
cy = round(H * 0.62) - ch // 2   # center on burger (~62% down)
cy = max(0, min(H - ch, cy))
crop = h1[cy:cy + ch, 0:cw]
save(crop, "assets/edition-1.jpg", w=1400, q=88)

# 4) edition-2.jpg: crop combo 1:1 center (cut garbled text at edges) to 4:3
c1 = cv2.imread("refs/ref-combo.png")
H, W = c1.shape[:2]  # 1024x1024
cw = round(W * 0.74)         # central 74% width
ch = round(cw * 3 / 4)
cx = (W - cw) // 2
cy = round(H * 0.52) - ch // 2
cy = max(0, min(H - ch, cy))
crop = c1[cy:cy + ch, cx:cx + cw]
save(crop, "assets/edition-2.jpg", w=1400, q=88)
print("DONE")
