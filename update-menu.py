# -*- coding: utf-8 -*-
# تحديث المنيو من طلبات بأمر واحد: python update-menu.py
# يعيد سحب الأصناف والأسعار ويولّد assets/menu-data.js وينزّل الصور الجديدة فقط.
import re, json, os, urllib.request, concurrent.futures as cf

os.chdir(os.path.dirname(os.path.abspath(__file__)))
URL = "https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36",
      "Accept-Language": "ar,en;q=0.9"}

print("fetching talabat page…")
html = urllib.request.urlopen(urllib.request.Request(URL, headers=UA), timeout=60).read().decode("utf-8")
m = re.search(r'<script id="__NEXT_DATA__" type="application/json"[^>]*>(.*?)</script>', html, re.S)
data = json.loads(m.group(1))
md = data["props"]["pageProps"]["initialMenuState"]["menuData"]

menu, jobs = [], []
for c in md["categories"]:
    cname = c.get("name", "").strip()
    if "اختيارات" in cname:
        continue
    items = []
    for it in c.get("items", []):
        items.append({"id": it["id"], "name": it.get("name", "").strip(),
                      "desc": (it.get("description") or "").strip(),
                      "price": it.get("price"), "oldPrice": it.get("oldPrice", -1),
                      "hasImg": bool(it.get("isWithImage"))})
        if it.get("isWithImage") and it.get("originalImage"):
            jobs.append((it["id"], it["originalImage"] + "?width=560&height=560"))
    menu.append({"cat": cname, "items": items})

open("assets/menu-data.js", "w", encoding="utf-8").write(
    "const BURGERATO_MENU = " + json.dumps(menu, ensure_ascii=False, separators=(",", ":")) + ";\n")
tot = sum(len(c["items"]) for c in menu)
print(f"categories: {len(menu)} | items: {tot} -> assets/menu-data.js")

os.makedirs("assets/menu", exist_ok=True)
def dl(j):
    iid, url = j
    out = f"assets/menu/{iid}.jpg"
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        return "skip"
    try:
        d = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
        open(out, "wb").write(d)
        return "new"
    except Exception as e:
        return f"ERR {iid}"
with cf.ThreadPoolExecutor(8) as ex:
    res = list(ex.map(dl, jobs))
print("images — new:", res.count("new"), "| cached:", res.count("skip"),
      "| errors:", [r for r in res if r.startswith("ERR")][:5])
print("تم — حدّث الصفحة في المتصفح.")
