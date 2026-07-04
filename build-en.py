# -*- coding: utf-8 -*-
# Build en.html from index.html: full translation map + LTR flips. Engine untouched.
import os, re, sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))
src = open("index.html", encoding="utf-8").read()

BASE = "https://burgerato.ae/"
R = []  # (old, new) exact replacements, applied in order

# ---------- document / head ----------
R += [
 ('<html lang="ar" dir="rtl">', '<html lang="en" dir="ltr">'),
 ('<title>برجراتو — سماش برجر | بني ياس، أبوظبي</title>',
  '<title>Burgerato — Smash Burger | Baniyas, Abu Dhabi</title>'),
 ('<meta name="description" content="وجبة السماش من برجراتو: طبقتان من اللحم الطازج تُسحقان على الصاج، شيدر ذائب وصوص سرّي — ٣٢ درهماً مع البطاط والمشروب. اطلب الآن في بني ياس، أبوظبي." />',
  '<meta name="description" content="Burgerato\'s Smash meal: two fresh beef patties smashed on the griddle, molten cheddar and a secret sauce — AED 32 with fries and a drink. Order now in Baniyas, Abu Dhabi." />'),
 (f'<link rel="canonical" href="{BASE}" />',
  f'<link rel="canonical" href="{BASE}en.html" />\n<link rel="alternate" hreflang="ar" href="{BASE}" />\n<link rel="alternate" hreflang="en" href="{BASE}en.html" />'),
 (f'<meta property="og:url" content="{BASE}" />', f'<meta property="og:url" content="{BASE}en.html" />'),
 ('<meta property="og:title" content="برجراتو — سماش برجر" />', '<meta property="og:title" content="Burgerato — Smash Burger" />'),
 ('<meta property="og:description" content="طبقتان، شيدر ذائب، وصوص سرّي. وجبة كاملة بـ٣٢ درهماً — بني ياس، أبوظبي." />',
  '<meta property="og:description" content="Two patties, molten cheddar, secret sauce. Full meal AED 32 — Baniyas, Abu Dhabi." />'),
]

# ---------- JSON-LD ----------
R += [
 ('"name": "مطعم برجراتو — Burgerato Restaurant",', '"name": "Burgerato Restaurant",'),
 ('"streetAddress": "شارع المويجعي — شارع الناير",', '"streetAddress": "Al Dhayir Street, near Bawabat Al Sharq",'),
 ('"addressLocality": "بني ياس شرق",', '"addressLocality": "Baniyas East",'),
 ('"addressRegion": "أبوظبي",', '"addressRegion": "Abu Dhabi",'),
 ('{"@type": "Question", "name": "هل التوصيل متاح؟", "acceptedAnswer": {"@type": "Answer", "text": "نعم — التوصيل حول بني ياس وضواحيها عبر تطبيق طلبات، أو مباشرة عبر واتساب المطعم 050 588 2658."}},',
  '{"@type": "Question", "name": "Is delivery available?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — delivery around Baniyas and nearby areas via Talabat, or directly via the restaurant WhatsApp 050 588 2658."}},'),
 ('{"@type": "Question", "name": "كم سعر وجبة السماش برجر؟", "acceptedAnswer": {"@type": "Answer", "text": "٣٢ درهماً وجبة كاملة — برجر سماش طبقتين مع البطاط والمشروب الغازي."}},',
  '{"@type": "Question", "name": "How much is the Smash burger meal?", "acceptedAnswer": {"@type": "Answer", "text": "AED 32 for a full meal — a double smash burger with fries and a soft drink."}},'),
 ('{"@type": "Question", "name": "أين يقع مطعم برجراتو؟", "acceptedAnswer": {"@type": "Answer", "text": "بني ياس شرق — الغابات، أبوظبي، الإمارات."}},',
  '{"@type": "Question", "name": "Where is Burgerato located?", "acceptedAnswer": {"@type": "Answer", "text": "Al Dhayir Street, Baniyas East, Abu Dhabi, UAE. Open daily 1:00 PM to 2:00 AM."}},'),
 ('{"@type": "Question", "name": "كيف أطلب من برجراتو؟", "acceptedAnswer": {"@type": "Answer", "text": "عبر تطبيق طلبات، أو واتساب 050 588 2658، أو اتصال مباشر 02 585 84 95."}}',
  '{"@type": "Question", "name": "How do I order from Burgerato?", "acceptedAnswer": {"@type": "Answer", "text": "Via the Talabat app, WhatsApp 050 588 2658, or by phone 02 585 84 95."}}'),
]

# ---------- header / nav ----------
R += [
 ('aria-label="برجراتو"', 'aria-label="Burgerato"'),
 ('<span class="wm">برجراتو</span>', '<span class="wm">Burgerato</span>'),
 ('<a href="#reveal">السماش</a><a href="#ritual">اللحظة</a><a href="#menu">المنيو</a><a href="en.html" lang="en" style="letter-spacing:.08em">EN</a>\n    <a class="nav-cta" href="#cta">اطلب الآن</a>',
  '<a href="#reveal">The Smash</a><a href="#ritual">The Moment</a><a href="#menu">Menu</a><a href="./" lang="ar">عربي</a>\n    <a class="nav-cta" href="#cta">Order Now</a>'),
]

# ---------- hero ----------
R += [
 ('<img class="hero-media" src="assets/product-cut.webp" alt="سماش برجراتو — طبقتان وشيدر ذائب وصوص سرّي" loading="eager" />',
  '<img class="hero-media" src="assets/product-cut.webp" alt="Burgerato Smash — two patties, molten cheddar, secret sauce" loading="eager" />'),
 ('<h1>برجراتو</h1>', '<h1>Burgerato</h1>'),
 ('<div class="sub">طبقتان من اللحم الطازج، شيدر يذوب على الصاج، وصوصنا السرّي — هذا هو السماش.</div>',
  '<div class="sub">Two fresh beef patties, cheddar melting on the griddle, and our secret sauce — this is the Smash.</div>'),
 ('<a class="btn btn-ghost hero-order" href="#cta">اطلب الآن — وجبة بـ٣٢ د.إ</a>',
  '<a class="btn btn-ghost hero-order" href="#cta">Order Now — Full Meal AED 32</a>'),
 ('<div class="hero-rate">تقييم <b>★ ٤٫٨</b> على جوجل (١٣٠ مراجعة)</div>',
  '<div class="hero-rate"><b>★ 4.8</b> on Google (130 reviews)</div>'),
 ('<div class="scrollcue"><span>اكتشف</span><span class="bar"></span></div>',
  '<div class="scrollcue"><span>Discover</span><span class="bar"></span></div>'),
]

# ---------- film captions ----------
R += [
 ('<div class="cap" data-a="0.03" data-b="0.22">لحمٌ طازج يُفرم يومياً…<br/>ويُسحق على صاجٍ ملتهب</div>',
  '<div class="cap" data-a="0.03" data-b="0.22">Fresh beef, ground daily…<br/>smashed on a blazing griddle</div>'),
 ('<div class="cap" data-a="0.31" data-b="0.48">شيدر أمريكي يذوب<br/>فوق القرمشة</div>',
  '<div class="cap" data-a="0.31" data-b="0.48">American cheddar melting<br/>over the crispy crust</div>'),
 ('<div class="cap" data-a="0.56" data-b="0.71">الصوص السرّي…<br/>ثم يهبط التاج</div>',
  '<div class="cap" data-a="0.56" data-b="0.71">The secret sauce…<br/>then the crown lands</div>'),
 ('<div class="cap" data-a="0.79" data-b="0.98">وُلد سماش برجراتو</div>',
  '<div class="cap" data-a="0.79" data-b="0.98">The Burgerato Smash is born</div>'),
 ('<img class="film-fallback" src="assets/product-hero.jpg" alt="سماش برجراتو" />',
  '<img class="film-fallback" src="assets/product-hero.jpg" alt="Burgerato Smash" />'),
]

# ---------- reveal ----------
R += [
 ('<div class="shot fallback-host reveal"><img src="assets/product-hero.jpg" alt="سماش برجراتو من قرب" loading="lazy" /></div>',
  '<div class="shot fallback-host reveal"><img src="assets/product-hero.jpg" alt="Burgerato Smash close-up" loading="lazy" /></div>'),
 ('<span class="idx reveal">٠١ — التشريح</span>', '<span class="idx reveal">01 — The Anatomy</span>'),
 ('<h2 class="gold-text reveal">تشريح السماش</h2>', '<h2 class="gold-text reveal">Anatomy of the Smash</h2>'),
 ('<p class="lead reveal">لا شيء يختبئ في سماش برجراتو: مكوّناتٌ قليلة، وصنعةٌ كثيرة. كل طبقة لها وظيفة — وكل قضمة تُثبت ذلك.</p>',
  '<p class="lead reveal">Nothing hides in a Burgerato Smash: few ingredients, plenty of craft. Every layer has a job — and every bite proves it.</p>'),
 ('<li class="reveal"><span class="k">اللحم</span><span class="v">بقري طازج ١٠٠٪ يُسحق على الصاج الملتهب</span></li>',
  '<li class="reveal"><span class="k">The Beef</span><span class="v">100% fresh beef, smashed on a blazing griddle</span></li>'),
 ('<li class="reveal"><span class="k">الجبنة</span><span class="v">شيدر أمريكي يذوب فوق القرمشة</span></li>',
  '<li class="reveal"><span class="k">The Cheese</span><span class="v">American cheddar melting over the crust</span></li>'),
 ('<li class="reveal"><span class="k">الصوص</span><span class="v">خلطة برجراتو السرّية بالتوابل</span></li>',
  '<li class="reveal"><span class="k">The Sauce</span><span class="v">Burgerato\'s secret spiced blend</span></li>'),
 ('<li class="reveal"><span class="k">الخبز</span><span class="v">بريوش بالزبدة محمّصٌ حتى اللمعان</span></li>',
  '<li class="reveal"><span class="k">The Bun</span><span class="v">Buttered brioche, toasted to a shine</span></li>'),
 ('<li class="reveal price"><span class="k">الوجبة</span><span class="v">٣٢ درهماً — مع البطاط والمشروب الغازي</span></li>',
  '<li class="reveal price"><span class="k">The Meal</span><span class="v">AED 32 — with fries and a soft drink</span></li>'),
]

# ---------- ritual ----------
R += [
 ('<img src="assets/ritual.jpg?v=2" alt="لحظة وضع التاج على سماش برجراتو" loading="lazy" />',
  '<img src="assets/ritual.jpg?v=2" alt="Crowning the Burgerato Smash" loading="lazy" />'),
 ('<span class="idx">٠٢ — اللحظة</span>', '<span class="idx">02 — The Moment</span>'),
 ('<h2 class="gold-text">من الصاج… إلى يدك</h2>', '<h2 class="gold-text">From the Griddle… to Your Hands</h2>'),
 ('<p>في بني ياس بأبوظبي، يخرج السماش ساخناً يتصاعد بخاره — ليصلك كما خرج من اللهب، في المطعم أو حتى باب بيتك.</p>',
  '<p>In Baniyas, Abu Dhabi, the Smash comes off the griddle steaming hot — reaching you just as it left the flame, in-house or at your doorstep.</p>'),
]

# ---------- CTA ----------
WA_EN = "https://wa.me/971505882658?text=Hello%20Burgerato!%20I%27d%20like%20to%20order%20a%20Smash%20meal%20%F0%9F%8D%94"
R += [
 ('<span class="latin">Order Now</span>', '<span class="latin">Order Now</span>'),
 ('<h2 class="gold-text">جوعك يستاهل سماش</h2>', '<h2 class="gold-text">Your Hunger Deserves a Smash</h2>'),
 ('<p>وجبة كاملة بـ<b>٣٢ درهماً</b> — برجر، بطاط، ومشروب. اطلبها الآن وتوصلك ساخنةً أينما كنت حول بني ياس.</p>',
  '<p>A full meal for <b>AED 32</b> — burger, fries and a drink. Order now and it arrives hot, anywhere around Baniyas.</p>'),
 ('<div class="btns"><a class="btn btn-primary" href="https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762" target="_blank" rel="noopener">اطلب عبر طلبات</a><a class="btn btn-ghost" href="https://wa.me/971505882658?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A8%D8%B1%D8%AC%D8%B1%D8%A7%D8%AA%D9%88%21%20%D8%A3%D8%A8%D8%BA%D9%89%20%D8%A3%D8%B7%D9%84%D8%A8%20%D9%88%D8%AC%D8%A8%D8%A9%20%D8%B3%D9%85%D8%A7%D8%B4%20%F0%9F%8D%94" target="_blank" rel="noopener">أو واتساب</a></div>',
  f'<div class="btns"><a class="btn btn-primary" href="https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762" target="_blank" rel="noopener">Order on Talabat</a><a class="btn btn-ghost" href="{WA_EN}" target="_blank" rel="noopener">or WhatsApp</a></div>'),
 ('<div class="apps"><b>يوصلك عبر:</b> <a href="https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762" target="_blank" rel="noopener" style="color:var(--gold-bright);text-decoration:none">طلبات</a> <span>·</span> نون فود <span>·</span> كيتا <span>·</span> كريم <span>·</span> ديليفرو <span>·</span> <a href="tel:+97125858495" style="color:inherit;text-decoration:none">هاتف 02 585 84 95</a></div>',
  '<div class="apps"><b>Delivered via:</b> <a href="https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762" target="_blank" rel="noopener" style="color:var(--gold-bright);text-decoration:none">Talabat</a> <span>·</span> Noon Food <span>·</span> Keeta <span>·</span> Careem <span>·</span> Deliveroo <span>·</span> <a href="tel:+97125858495" style="color:inherit;text-decoration:none">Call 02 585 84 95</a></div>'),
]

# ---------- editions ----------
R += [
 ('<div class="head"><span class="idx reveal">٠٣ — القائمة</span><h2 class="gold-text reveal">أبطالٌ آخرون على الصاج</h2></div>',
  '<div class="head"><span class="idx reveal">03 — The Heroes</span><h2 class="gold-text reveal">More Heroes on the Griddle</h2></div>'),
 ('<article class="ed-card reveal"><div class="pic fallback-host"><img src="assets/product-hero.jpg" alt="سماش برجراتو" loading="lazy" /></div>\n          <div class="body"><h3>سماش برجراتو</h3><p>البطل نفسه — طبقتان، شيدر ذائب، وصوص سرّي.</p><span class="tag">وجبة · ٣٢ د.إ</span></div></article>',
  '<article class="ed-card reveal"><div class="pic fallback-host"><img src="assets/product-hero.jpg" alt="Burgerato Smash" loading="lazy" /></div>\n          <div class="body"><h3>Burgerato Smash</h3><p>The hero itself — two patties, molten cheddar, secret sauce.</p><span class="tag">Meal · AED 32</span></div></article>'),
 ('<article class="ed-card reveal"><div class="pic fallback-host"><img src="assets/edition-1.jpg?v=2" alt="حاشي برجراتو بالمشروم" loading="lazy" /></div>\n          <div class="body"><h3>حاشي برجراتو بالمشروم</h3><p>لحم حاشي طازج تحت صوص المشروم والبصل الكريمي — وتاج المايونيز علامتنا.</p><span class="tag">وجبة · ٤٥ د.إ</span></div></article>',
  '<article class="ed-card reveal"><div class="pic fallback-host"><img src="assets/edition-1.jpg?v=2" alt="Mushroom Hashi Burgerato" loading="lazy" /></div>\n          <div class="body"><h3>Mushroom Hashi Burgerato</h3><p>Fresh camel meat under a creamy mushroom-onion sauce — crowned with our signature mayo dots.</p><span class="tag">Meal · AED 45</span></div></article>'),
 ('<article class="ed-card reveal"><div class="pic fallback-host"><img src="assets/edition-2.jpg?v=2" alt="كومبو البطلين" loading="lazy" /></div>\n          <div class="body"><h3>كومبو البطلين</h3><p>سماش + حاشي المشروم معاً — للجوع الجماعي.</p><span class="tag">وجبتان · ٧٧ د.إ</span></div></article>',
  '<article class="ed-card reveal"><div class="pic fallback-host"><img src="assets/edition-2.jpg?v=2" alt="The Two Heroes Combo" loading="lazy" /></div>\n          <div class="body"><h3>The Two Heroes Combo</h3><p>Smash + Mushroom Hashi together — for serious hunger.</p><span class="tag">Two meals · AED 77</span></div></article>'),
]

# ---------- menu section ----------
R += [
 ('<span class="idx reveal">٠٤ — المنيو</span>', '<span class="idx reveal">04 — Menu</span>'),
 ('<h2 class="gold-text reveal">قائمة برجراتو الكاملة</h2>', '<h2 class="gold-text reveal">The Full Burgerato Menu</h2>'),
 ('<p class="menu-sub reveal">القائمة الرسمية بالأسعار — اختر قسمك، والطلب يوصلك عبر طلبات أو واتساب.</p>',
  '<p class="menu-sub reveal">The official menu with prices — pick a category, then order via Talabat or WhatsApp.</p>'),
 ('<a class="btn btn-primary" href="https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762" target="_blank" rel="noopener">اطلب عبر طلبات</a>\n        <a class="btn btn-ghost" href="https://wa.me/971505882658?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A8%D8%B1%D8%AC%D8%B1%D8%A7%D8%AA%D9%88%21" target="_blank" rel="noopener">أو عبر واتساب</a>',
  f'<a class="btn btn-primary" href="https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762" target="_blank" rel="noopener">Order on Talabat</a>\n        <a class="btn btn-ghost" href="{WA_EN}" target="_blank" rel="noopener">or via WhatsApp</a>'),
]

# ---------- FAQ ----------
R += [
 ('<div class="head"><span class="idx reveal">٠٥ — أسئلة شائعة</span><h2 class="gold-text reveal">كل ما تريد معرفته</h2></div>',
  '<div class="head"><span class="idx reveal">05 — FAQ</span><h2 class="gold-text reveal">Everything You Need to Know</h2></div>'),
 ('<details><summary>هل التوصيل متاح؟</summary><div class="fa">نعم — التوصيل حول بني ياس وضواحيها عبر <a href="https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762" target="_blank" rel="noopener">طلبات</a>، أو مباشرة عبر <a href="https://wa.me/971505882658" target="_blank" rel="noopener">واتساب المطعم</a>.</div></details>',
  '<details><summary>Is delivery available?</summary><div class="fa">Yes — delivery around Baniyas and nearby areas via <a href="https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762" target="_blank" rel="noopener">Talabat</a>, or directly via the <a href="https://wa.me/971505882658" target="_blank" rel="noopener">restaurant WhatsApp</a>.</div></details>'),
 ('<details><summary>كم سعر وجبة السماش برجر؟</summary><div class="fa">٣٢ درهماً وجبة كاملة — برجر سماش طبقتين مع البطاط والمشروب الغازي. وتجد أسعار كل الأصناف في <a href="#menu">المنيو أعلاه</a>.</div></details>',
  '<details><summary>How much is the Smash burger meal?</summary><div class="fa">AED 32 for a full meal — a double smash burger with fries and a soft drink. All other prices are in the <a href="#menu">menu above</a>.</div></details>'),
 ('<details><summary>أين يقع المطعم؟ ومتى يفتح؟</summary><div class="fa">شارع المويجعي — شارع الناير (قرب بوابة الشرق)، بني ياس شرق، أبوظبي. مفتوح يومياً من ١:٠٠ ظهراً حتى ٢:٠٠ فجراً. <a href="https://www.google.com/maps/search/?api=1&query=24.323836%2C54.619407" target="_blank" rel="noopener">اضغط هنا للاتجاهات عبر خرائط جوجل</a>.</div></details>',
  '<details><summary>Where is the restaurant? When does it open?</summary><div class="fa">Al Dhayir Street (near Bawabat Al Sharq), Baniyas East, Abu Dhabi. Open daily from 1:00 PM to 2:00 AM. <a href="https://www.google.com/maps/search/?api=1&query=24.323836%2C54.619407" target="_blank" rel="noopener">Tap here for directions on Google Maps</a>.</div></details>'),
 ('<details><summary>كيف أطلب؟</summary><div class="fa">ثلاث طرق: <a href="https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762" target="_blank" rel="noopener">تطبيق طلبات</a>، أو واتساب <a href="https://wa.me/971505882658" target="_blank" rel="noopener" dir="ltr">050 588 2658</a>، أو اتصال مباشر <a href="tel:+97125858495" dir="ltr">02 585 84 95</a>.</div></details>',
  '<details><summary>How do I order?</summary><div class="fa">Three ways: the <a href="https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762" target="_blank" rel="noopener">Talabat app</a>, WhatsApp <a href="https://wa.me/971505882658" target="_blank" rel="noopener">050 588 2658</a>, or call <a href="tel:+97125858495">02 585 84 95</a>.</div></details>'),
]

# ---------- footer ----------
R += [
 ('<img src="assets/logo-full.webp" alt="برجراتو — Burgerato Restaurant"', '<img src="assets/logo-full.webp" alt="Burgerato Restaurant"'),
 ('<span class="rate"><b>★ ٤٫٨</b> على جوجل · <b>★ ٤٫٢</b> على طلبات</span>',
  '<span class="rate"><b>★ 4.8</b> on Google · <b>★ 4.2</b> on Talabat</span>'),
 ('<span id="hoursChip">🕐 يومياً ١:٠٠ م – ٢:٠٠ ص</span>', '<span id="hoursChip">🕐 Daily 1:00 PM – 2:00 AM</span>'),
 ('<a href="https://www.google.com/maps/search/?api=1&query=24.323836%2C54.619407" target="_blank" rel="noopener">📍 شارع المويجعي — بني ياس شرق · الاتجاهات</a>',
  '<a href="https://www.google.com/maps/search/?api=1&query=24.323836%2C54.619407" target="_blank" rel="noopener">📍 Al Dhayir St — Baniyas East · Directions</a>'),
 ('<a href="https://wa.me/971505882658" target="_blank" rel="noopener">واتساب المطعم</a>',
  '<a href="https://wa.me/971505882658" target="_blank" rel="noopener">WhatsApp</a>'),
 ('<div class="about">«الخدمة ممتازة والتعامل راقٍ والأكل ممتاز، وأسعارهم تناسب أي شخص» — من مراجعات جوجل ★٤٫٨<br/>برجراتو مطعمٌ إماراتي في بني ياس شرق بأبوظبي، متخصّص في السماش برجر الطازج المسحوق على الصاج أمامك — ووجهة أهل المنطقة للبرجر والدجاج المقلي والباستا، في المطعم أو حتى باب بيتك.</div>',
  '<div class="about">"Excellent service, classy treatment, great food — and prices that suit everyone" — from Google reviews ★4.8<br/>Burgerato is an Emirati restaurant in Baniyas East, Abu Dhabi, specialising in fresh smash burgers pressed on the griddle before your eyes — the neighbourhood\'s home for burgers, fried chicken and pasta, dine-in or delivered.</div>'),
 ('<nav class="links"><a href="#reveal">السماش</a><a href="#ritual">اللحظة</a><a href="#menu">المنيو</a><a href="https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762" target="_blank" rel="noopener">اطلب عبر طلبات</a></nav>',
  '<nav class="links"><a href="#reveal">The Smash</a><a href="#ritual">The Moment</a><a href="#menu">Menu</a><a href="https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762" target="_blank" rel="noopener">Order on Talabat</a><a href="./" lang="ar">النسخة العربية</a></nav>'),
 ('<div class="cr">© ٢٠٢٦ مطعم برجراتو — جميع الحقوق محفوظة</div>',
  '<div class="cr">© 2026 Burgerato Restaurant — All rights reserved</div>'),
]

# ---------- FAB ----------
R += [
 ('<a class="fab-opt" href="https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762" target="_blank" rel="noopener">🛵 اطلب عبر طلبات</a>',
  '<a class="fab-opt" href="https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762" target="_blank" rel="noopener">🛵 Order on Talabat</a>'),
 ('<a class="fab-opt" href="https://wa.me/971505882658?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A8%D8%B1%D8%AC%D8%B1%D8%A7%D8%AA%D9%88%21%20%D8%A3%D8%A8%D8%BA%D9%89%20%D8%A3%D8%B7%D9%84%D8%A8%20%F0%9F%8D%94" target="_blank" rel="noopener">💬 واتساب مباشر</a>',
  f'<a class="fab-opt" href="{WA_EN}" target="_blank" rel="noopener">💬 WhatsApp direct</a>'),
 ('<button class="fab-main" type="button" aria-label="اطلب الآن">🍔 اطلب الآن</button>',
  '<button class="fab-main" type="button" aria-label="Order now">🍔 Order Now</button>'),
]

# ---------- scripts: menu data + rendering + openNow ----------
R += [
 ('<script src="assets/menu-data.js" defer></script>', '<script src="assets/menu-data-en.js" defer></script>'),
 ('if(typeof BURGERATO_MENU==="undefined"){setTimeout(build,150);return;}', 'if(typeof BURGERATO_MENU_EN==="undefined"){setTimeout(build,150);return;}'),
 ('BURGERATO_MENU.forEach((c,i)=>{', 'BURGERATO_MENU_EN.forEach((c,i)=>{'),
 ('BURGERATO_MENU[active].items.forEach(it=>{', 'BURGERATO_MENU_EN[active].items.forEach(it=>{'),
 ("const AR=\"٠١٢٣٤٥٦٧٨٩\";\n      const num=n=>String(n).replace(/\\d/g,d=>AR[+d]);", "const num=n=>String(n);"),
 ("'<span class=\"mold\">'+num(it.oldPrice)+'</span><span class=\"moff\">خصم</span>'", "'<span class=\"mold\">'+num(it.oldPrice)+'</span><span class=\"moff\">OFF</span>'"),
 ("'<div class=\"mrow\"><span class=\"mprice\">'+num(it.price)+' د.إ</span>'", "'<div class=\"mrow\"><span class=\"mprice\">AED '+num(it.price)+'</span>'"),
 ("?'<span style=\"color:#7DC97F\">●</span> مفتوح الآن — يومياً ١:٠٠ م حتى ٢:٠٠ ص'\n        :'<span style=\"color:#C4502E\">●</span> مغلق الآن — يفتح ١:٠٠ ظهراً';",
  "?'<span style=\"color:#7DC97F\">●</span> Open now — daily 1:00 PM to 2:00 AM'\n        :'<span style=\"color:#C4502E\">●</span> Closed now — opens 1:00 PM';"),
]

# ---------- LTR style overrides (appended before </style>) ----------
LTR_CSS = """
  /* EN / LTR overrides */
  #progress{transform-origin:left}
  #film .caps{right:auto;left:clamp(20px,6vw,98px);text-align:left}
  #film .cap{right:auto;left:0}
  #film .loader{left:auto;right:clamp(18px,5vw,42px)}
  #reveal .copy{text-align:left}
  #reveal .lead{margin-inline-start:0;margin-inline-end:auto}
  #reveal .specs li{justify-content:flex-start}
  #ritual .copy{right:auto;left:clamp(24px,5vw,72px);text-align:left}
  #ritual p{margin-inline-start:0;margin-inline-end:auto}
  #ritual .frame::after{background:linear-gradient(to right,rgba(11,8,5,.88),rgba(11,8,5,.3) 52%,transparent 84%),linear-gradient(0deg,rgba(11,8,5,.82),transparent 52%)}
  #fab{left:auto;right:22px;align-items:flex-end}
"""
R += [("\n</style>", LTR_CSS + "\n</style>")]

out = src
missed = []
for old, new in R:
    if old not in out:
        missed.append(old[:80])
        continue
    out = out.replace(old, new, 1)

open("en.html", "w", encoding="utf-8").write(out)
print("en.html written,", len(out), "chars")
if missed:
    print("MISSED", len(missed), "replacements:")
    for m in missed: print("  -", m)
else:
    print("all replacements applied")
# leftover Arabic check (excluding the two intentional عربي switch labels)
import re as _re
ar = _re.findall(r'[؀-ۿ][^<>\n]{0,60}', out)
ar = [a for a in ar if 'عربي' not in a]
print("leftover Arabic snippets:", len(ar))
for a in ar[:12]: print("  ?", a)
