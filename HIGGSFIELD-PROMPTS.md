# Burgerato Smash — Higgsfield Prompt List

## البريف الإبداعي
- **الثيم:** داكن فاخر (Dark luxury). أرضية إسبريسو قريبة من الأسود `#0B0805`، إضاءة كاشطة دافئة واحدة.
- **الباليت:** ذهب الشيدر الذائب (`#F0A93C / #D98E2B / #A96A1C`) + كراميل البريوش + كريمي الصوص، نص كريمي `#F4EAD8` على إسبريسو. لمسة حمراء من الشعار للسعر فقط.
- **القصة (الفيلم):** «ولادة السماش» — كرة لحم طازج على الصاج → السحقة (اللقطة الشهيرة) → الشيدر يذوب → التكديس والصوص → البرجر المكتمل (مطابق للمرجع).
- **الهوية:** المرجع الأم = `refs/ref-smash-product.jpg` (صورة العميل المرفقة، الموجودة في مخزن Higgsfield). هوية البرجر (بريوش لامع، طبقتان، شيدر سائل، صوص مبقّع بالتوابل) **لا تتغير أبداً**.
- **الاحتشام:** لا وجوه ولا أشخاص في كل الأصول — أيادي بقفازات سوداء فقط في لقطة "اللحظة".

### Shared spec (يُلصق في كل برومبت منتج)
> Deep espresso near-black #0B0805 background fading to the same tone at every edge and corner, single dramatic warm raking light from the upper left, faint steam, editorial luxury food photography, hyper-detailed, no extra text, no watermark, no logo, no people.

### Identity clause (لكل ما يظهر فيه البرجر)
> Keep the EXACT identity of the reference burger: glossy toasted brioche bun, two smashed beef patties with crispy lacy edges, molten cheddar cascading, creamy spice-flecked special sauce. No redesign.

---

## A · فيلم التحوّل (K1→K5 + V1→V4) — متطابق الحدود
كل الإطارات: `nano_banana_2` · `--image <MASTER_ID>` · `16:9` · `2k`. كل المقاطع: `seedance_2_0` · `--aspect_ratio 16:9 --resolution 1080p --duration 5 --bitrate_mode high --generate_audio false --mode std`.

- **K1** — `assets/seq-src/k1.jpg` — *A single loosely-packed ball of fresh raw ground beef resting on a hot dark steel griddle, oil shimmer and faint smoke, the beef matching the reference burger's meat.* + shared spec.
- **K2** — `assets/seq-src/k2.jpg` — *The same beef now smashed flat on the same dark griddle by a heavy steel spatula (spatula still pressing at frame edge), crispy caramelized lacy edges, sizzling, small steam burst.* + shared spec.
- **K3** — `assets/seq-src/k3.jpg` — *The same seared smashed patty on the same griddle with a thick slice of cheddar mid-melt draping over it, molten cheddar drips matching the reference burger's cheese tone.* + shared spec.
- **K4** — `assets/seq-src/k4.jpg` — *The same two seared patties now stacked with molten cheddar between and creamy spice-flecked special sauce flowing on top, sitting on the toasted bottom bun on dark slate; the glossy brioche crown hovers slightly above, about to land.* + identity clause + shared spec.
- **K5** — `assets/seq-src/k5.jpg` — *The completed burger — EXACTLY the reference burger — centered, hero pose, gentle steam.* + identity clause + shared spec.
- **V1** `assets/v1.mp4` — start K1 end K2 — *The steel spatula slowly smashes the beef ball flat; lacy edges spread outward; sizzling steam. Locked camera, slow motion, no cuts, no flicker, no morphing artifacts.*
- **V2** `assets/v2.mp4` — start K2 end K3 — *A slice of cheddar is laid onto the seared patty and slowly begins to melt and drape. Locked camera, slow motion, no cuts, no flicker.*
- **V3** `assets/v3.mp4` — start K3 end K4 — *The molten-cheese patty is lifted and stacked; special sauce pours slowly; the bun crown enters hovering. Locked camera, slow motion, no cuts, no flicker.*
- **V4** `assets/v4.mp4` — start K4 end K5 — *The glossy brioche crown lands softly on the stack; steam wisps; slight pull-back to the completed hero. Slow, no cuts, no flicker.*
- ثم الاستخراج → `assets/seq/f000.jpg…` (OpenCV، ‏24/مقطع، إسقاط الإطار الحدودي المكرر) → ضبط `FRAME_COUNT` (المتوقع 93).

## B · صور الأقسام
- **RITUAL** — `assets/ritual.jpg` — i2i من MASTER، 16:9، 2k — *Two hands in black nitrile gloves presenting the exact reference burger on a dark rustic wooden board, rising steam, blurred dark restaurant background with warm amber bokeh lights. No faces, no people visible beyond the gloved hands.* + identity + shared spec.
- **EDITION-1 (حاشي)** — `assets/edition-1.jpg` — i2i من `refs/ref-hashi.png`، 4:3، 2k — *The EXACT same camel-meat burger from the reference (black sesame charcoal bun, thick seared camel patty, melted cheese, caramelized onions, smoky sauce, arugula) — recomposed as a centered 4:3 hero on the espresso ground, nothing else in frame.* + shared spec.
- **EDITION-2 (كومبو)** — `assets/edition-2.jpg` — i2i من MASTER + HASHI معاً، 4:3، 2k — *Both reference burgers side by side as a duo combo hero — the smash burger left, the black-bun camel burger right, a small pile of golden fries between them on dark wood.* + identity + shared spec.
- **PRODUCT-HERO** — `assets/product-hero.jpg` — نسخة محسّنة للويب من MASTER نفسه (بلا توليد).

## C · قصاصة البطل
- **CUT** — `assets/product-cut.png` — `image_background_remover --image <MASTER_ID>` → PNG شفاف للهيرو (بلا أي خدعة blend).

## D · فيديو الـCTA
- **V5** — `assets/cta.mp4` — seedance، start K5 end K5 — *The completed burger rotates very slowly, gentle steam wisps, a soft light sheen sweeps across the glossy bun. Seamless loop feel, locked framing, no cuts, no flicker.* — poster = `product-hero.jpg`.
- **V6** — `assets/life1.mp4` — seedance، start RITUAL — *Steam rises gently, warm bokeh lights flicker subtly, hands perfectly still. Very subtle, no cuts.*

### Run notes
- `higgsfield upload create refs/ref-smash-product.jpg --json` → MASTER_ID (وكذلك ref-hashi → HASHI_ID).
- `higgsfield generate create <model> ... --wait --wait-timeout 25m --json > outN.json`؛ اسحب `result_url` بـ grep (بلا jq)، نزّل بـ curl مع 3 محاولات، وتحقق أن الملف غير فارغ.
- الصور بالتوازي أولاً → تحقق بصري من كل إطار (الهوية/الحواف) → المقاطع دفعة ثانية → استخراج.
