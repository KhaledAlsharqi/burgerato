# -*- coding: utf-8 -*-
# تحديث المنيو من طلبات (العربية + الإنجليزية) بأمر واحد: python update-menu.py
# يولّد assets/menu-data.js وassets/menu-data-en.js وينزّل الصور الجديدة فقط، ثم يعيد بناء en.html.
import re, json, os, subprocess, sys, urllib.request, concurrent.futures as cf

os.chdir(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

SOURCES = [
    ("ar", "https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762",
     "assets/menu-data.js", "BURGERATO_MENU"),
    ("en", "https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762",
     "assets/menu-data-en.js", "BURGERATO_MENU_EN"),
]

jobs = {}
for lang, url, out_js, var in SOURCES:
    print(f"[{lang}] fetching talabat…")
    req = urllib.request.Request(url, headers=dict(UA, **{"Accept-Language": "ar" if lang == "ar" else "en"}))
    html = urllib.request.urlopen(req, timeout=60).read().decode("utf-8")
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json"[^>]*>(.*?)</script>', html, re.S)
    md = json.loads(m.group(1))["props"]["pageProps"]["initialMenuState"]["menuData"]
    menu = []
    for c in md["categories"]:
        cname = c.get("name", "").strip()
        if "اختيارات" in cname or "🔥" in cname or "your taste" in cname.lower():
            continue
        items = []
        for it in c.get("items", []):
            items.append({"id": it["id"], "name": it.get("name", "").strip(),
                          "desc": (it.get("description") or "").strip(),
                          "price": it.get("price"), "oldPrice": it.get("oldPrice", -1),
                          "hasImg": bool(it.get("isWithImage"))})
            if it.get("isWithImage") and it.get("originalImage"):
                jobs[it["id"]] = it["originalImage"] + "?width=560&height=560"
        menu.append({"cat": cname, "items": items})
    open(out_js, "w", encoding="utf-8").write(
        f"const {var} = " + json.dumps(menu, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(f"[{lang}] categories: {len(menu)} | items: {sum(len(c['items']) for c in menu)} -> {out_js}")

os.makedirs("assets/menu", exist_ok=True)
def dl(kv):
    iid, url = kv
    out = f"assets/menu/{iid}.jpg"
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        return "skip"
    try:
        d = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
        open(out, "wb").write(d)
        return "new"
    except Exception:
        return f"ERR {iid}"
with cf.ThreadPoolExecutor(8) as ex:
    res = list(ex.map(dl, jobs.items()))
print("images — new:", res.count("new"), "| cached:", res.count("skip"),
      "| errors:", [r for r in res if str(r).startswith("ERR")][:5])

# rebuild the English page so any copy stays in sync
r = subprocess.run([sys.executable, "-X", "utf8", "build-en.py"], capture_output=True, text=True)
print(r.stdout.strip().splitlines()[-1] if r.stdout else r.stderr[-200:])
print("تم — راجع ثم: git add -A && git commit && git push")
