# -*- coding: utf-8 -*-
# Compress heavy CTA videos with bundled ffmpeg (H.264 CRF, strip audio, faststart)
import imageio_ffmpeg, subprocess, os, shutil

os.chdir(os.path.dirname(os.path.abspath(__file__)))
FF = imageio_ffmpeg.get_ffmpeg_exe()
os.makedirs("gen/originals", exist_ok=True)

for name in ["cta", "v4", "v1", "v2", "v3"]:
    src = f"assets/{name}.mp4"
    if not os.path.exists(src):
        continue
    orig_mb = os.path.getsize(src) / 1e6
    if orig_mb < 9:
        print(f"{name}: {orig_mb:.1f}MB — small enough, skip")
        continue
    backup = f"gen/originals/{name}-orig.mp4"
    if not os.path.exists(backup):
        shutil.copy(src, backup)
    out = f"gen/{name}-c.mp4"
    cmd = [FF, "-y", "-i", backup, "-c:v", "libx264", "-crf", "25", "-preset", "slow",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0 and os.path.getsize(out) > 100000:
        new_mb = os.path.getsize(out) / 1e6
        shutil.move(out, src)
        print(f"{name}: {orig_mb:.1f}MB -> {new_mb:.1f}MB")
    else:
        print(f"{name}: FFMPEG FAIL", r.stderr[-300:] if r.stderr else "")
print("DONE")
