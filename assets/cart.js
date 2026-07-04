/* برجراتو — سلة واتساب V2.1
   إصلاحات تدقيق 2026-07-05: حارس السلة الفارغة، ملاحظات بطاقات تلقائية (المشروم)،
   تفريغ آمن بعد الإرسال (عبر الجلسات)، تنقية الأصناف الشبحية، انتهاء صلاحية GPS،
   شريط «مغلق الآن»، تلميح مشروب الوجبة، إدارة فوكس كاملة، تباين معتمد، aria معرّبة،
   عدّادات تعمل بالكيبورد، إصلاح اسم الحاشي الإنجليزي. */
(function () {
  "use strict";
  var EN = (document.documentElement.lang || "ar") === "en";
  var WA = "971505882658";
  var TALABAT = EN
    ? "https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762"
    : "https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762";
  var GPS_TTL = 6 * 3600 * 1000;          // دبوس أقدم من 6 ساعات يعاد التقاطه
  var OPEN_H = 13, CLOSE_H = 2;           // ساعات المطعم بتوقيت الإمارات

  var T = EN ? {
    add: "+ Add", cart: "Your order", empty: "Your basket is empty",
    browse: "Browse the menu", reorder: "🔁 Repeat my last order",
    send: "Send order via WhatsApp", total: "Estimated total",
    totalNote: "menu prices — restaurant confirms total & any delivery fee",
    delivery: "Delivery", pickup: "Pickup", name: "Your name",
    area: "Area / address (for delivery)", note: "Order notes + your drink choice for meals",
    itemNote: "Item note — e.g. no onions", talabat: "or order via Talabat",
    call: "or call 02 585 84 95", close: "Close", clear: "New basket",
    upsell: "Completes your order 👌",
    sent: "Sent? The restaurant will confirm shortly on WhatsApp.",
    viewCart: "View basket", msgTitle: "*New order — Burgerato*",
    msgRef: "Order ref", msgTotal: "Estimated total", msgName: "Name",
    msgArea: "Area/Address", msgNote: "Notes",
    msgFoot: "(official menu prices — restaurant confirms total & delivery fee)",
    currency: "AED", items: "items",
    gps: "📍 Attach my location (GPS)", gpsOk: "📍 Location attached ✓",
    gpsWait: "Locating…", gpsErr: "Couldn't get location — check permission",
    gpsAcc: "accuracy", msgMap: "📍 Map", remove: "✕",
    inc: "Increase quantity", dec: "Decrease quantity", noteBtn: "Add item note",
    removeLoc: "Remove location", drinkHint: "Meals include a drink — mention yours in the notes 🥤",
    closedNow: "The restaurant is closed now (opens 1:00 PM). You can still send your order — it will be confirmed at opening."
  } : {
    add: "+ أضف", cart: "طلبك", empty: "سلتك فارغة",
    browse: "تصفّح المنيو", reorder: "🔁 أعد طلبي السابق",
    send: "أرسل الطلب عبر واتساب", total: "المجموع التقريبي",
    totalNote: "أسعار المنيو الرسمية — يؤكد المطعم الإجمالي وأي رسوم توصيل",
    delivery: "توصيل", pickup: "استلام من الفرع", name: "اسمك",
    area: "المنطقة / العنوان (للتوصيل)", note: "ملاحظات + مشروبك المفضل للوجبات",
    itemNote: "ملاحظة الصنف — مثال: بدون بصل", talabat: "أو اطلب عبر طلبات",
    call: "أو اتصل 02 585 84 95", close: "إغلاق", clear: "سلة جديدة",
    upsell: "يكمّل طلبك 👌",
    sent: "أرسلت الطلب؟ سيؤكده المطعم سريعاً في واتساب.",
    viewCart: "عرض السلة", msgTitle: "*طلب جديد — برجراتو* 🍔",
    msgRef: "رقم الطلب", msgTotal: "المجموع التقريبي", msgName: "الاسم",
    msgArea: "المنطقة/العنوان", msgNote: "ملاحظات",
    msgFoot: "(أسعار المنيو الرسمية — يؤكد المطعم الإجمالي ورسوم التوصيل)",
    currency: "د.إ", items: "أصناف",
    gps: "📍 أرفق موقعي الحالي (GPS)", gpsOk: "📍 الموقع مُرفق ✓",
    gpsWait: "جاري التحديد…", gpsErr: "تعذر تحديد الموقع — تأكد من السماح",
    gpsAcc: "دقة", msgMap: "📍 الخريطة", remove: "✕",
    inc: "زيادة الكمية", dec: "إنقاص الكمية", noteBtn: "إضافة ملاحظة للصنف",
    removeLoc: "إزالة الموقع", drinkHint: "الوجبات تشمل مشروباً — اذكر مشروبك في الملاحظات 🥤",
    closedNow: "المطعم مغلق الآن (يفتح ١:٠٠ ظهراً). يمكنك إرسال طلبك وسيُؤكد عند الفتح."
  };
  var AR_D = "٠١٢٣٤٥٦٧٨٩";
  function num(n) { n = String(n); return EN ? n : n.replace(/\d/g, function (d) { return AR_D[+d]; }); }

  var SMASH = { id: "smash", name: EN ? "Smash Burgerato Meal" : "وجبة سماش برجراتو", price: 32 };
  // تصحيح ترجمة طلبات الخاطئة (حاشي = جمل لا بقر)
  var NAME_FIX = EN ? { "1427974055": { name: "Hashi (Camel) Burger Meal" } } : {};
  function menuData() { try { return (EN ? BURGERATO_MENU_EN : BURGERATO_MENU) || []; } catch (e) { return []; } }
  function findItem(id) {
    if (String(id) === "smash") return SMASH;
    var cats = menuData();
    for (var i = 0; i < cats.length; i++)
      for (var j = 0; j < cats[i].items.length; j++)
        if (String(cats[i].items[j].id) === String(id)) {
          var it = cats[i].items[j], fx = NAME_FIX[String(id)];
          return fx ? Object.assign({}, it, fx) : it;
        }
    return null;
  }

  /* ---------- state ---------- */
  function lsGet(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var state = lsGet("bgcart", {});
  var notes = lsGet("bgcart-notes", {});
  var cust = lsGet("bgcart-cust", { name: "", area: "", mode: "delivery", note: "" });
  var sentFlag = false;

  // طلب أُرسل في زيارة سابقة → أرشفه وابدأ سلة نظيفة (يمنع الإرسال المزدوج)
  var sentTs = lsGet("bgcart-sent", 0);
  if (sentTs && Object.keys(state).length) {
    lsSet("bgcart-last", { state: state, notes: notes, ts: sentTs });
    state = {}; notes = {};
    lsSet("bgcart", state); lsSet("bgcart-notes", notes);
    try { localStorage.removeItem("bgcart-sent"); } catch (e) {}
  }
  // دبوس GPS منتهي الصلاحية
  if (cust.loc && (!cust.loc.ts || Date.now() - cust.loc.ts > GPS_TTL)) delete cust.loc;

  function save() { lsSet("bgcart", state); lsSet("bgcart-notes", notes); lsSet("bgcart-cust", cust); }
  function count() { var c = 0; for (var k in state) c += state[k]; return c; }
  function total() { var t = 0; for (var k in state) { var it = findItem(k); if (it) t += it.price * state[k]; } return t; }
  function purgeGhosts() {            // أصناف اختفت من المنيو بعد تحديثه
    if (!menuData().length) return;   // لا تُطهّر قبل تحميل البيانات
    for (var k in state) if (!findItem(k)) { delete state[k]; delete notes[k]; }
  }
  function isOpenNow() {
    try {
      var h = parseInt(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Dubai" }).format(new Date()), 10);
      return h >= OPEN_H || h < CLOSE_H;
    } catch (e) { return true; }
  }
  function track(ev, extra) {
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev, currency: "AED", value: total() }, extra || {})); } catch (e) {}
  }

  /* ---------- styles ---------- */
  var css = ""
    + "#bgDrawerWrap{position:fixed;inset:0;z-index:95;display:none}"
    + "#bgDrawerWrap.on{display:block}"
    + "#bgBack{position:absolute;inset:0;background:rgba(5,3,2,.62);backdrop-filter:blur(3px)}"
    + "#bgDrawer{position:absolute;bottom:0;left:0;right:0;max-height:88vh;display:flex;flex-direction:column;"
    + "background:#14100A;border:1px solid rgba(240,200,140,.18);border-bottom:none;border-radius:18px 18px 0 0;"
    + "box-shadow:0 -30px 80px rgba(0,0,0,.6);padding:16px 16px 14px;color:#F4EAD8}"
    + "@media(min-width:700px){#bgDrawer{left:auto;right:auto;width:460px;margin-inline:auto;inset-inline:0}}"
    + "#bgDrawer h3{font-family:'El Messiri',serif;font-size:19px;margin:0 0 8px;display:flex;justify-content:space-between;align-items:center}"
    + "#bgDrawer .bgx{background:none;border:none;color:#A08A6A;font-size:22px;cursor:pointer;line-height:1;padding:4px}"
    + "#bgClosed{display:none;margin:0 0 8px;padding:9px 13px;border-radius:10px;font-size:12px;"
    + "background:rgba(240,169,60,.1);border:1px solid rgba(240,169,60,.35);color:#F0C27A}"
    + "#bgScroll{overflow-y:auto;flex:1;min-height:40px;overscroll-behavior:contain}"
    + ".bgrow{padding:9px 0;border-bottom:1px solid rgba(240,200,140,.1)}"
    + ".bgrow .r1{display:flex;align-items:center;gap:10px}"
    + ".bgrow .n{flex:1;font-size:13.5px;line-height:1.5}"
    + ".bgrow .p{font-family:'El Messiri',serif;color:#F0A93C;font-size:14px;white-space:nowrap}"
    + ".bgq{display:flex;align-items:center;gap:7px}"
    + ".bgq button{width:30px;height:30px;border-radius:50%;border:1px solid rgba(240,200,140,.35);background:transparent;color:#F0A93C;font-size:16px;cursor:pointer}"
    + ".bgq span{min-width:17px;text-align:center;font-weight:600}"
    + ".bgnotebtn{background:none;border:none;color:#A08A6A;cursor:pointer;font-size:14px;padding:2px 4px}"
    + ".bgnotebtn.has{color:#F0A93C}"
    + ".bgrow input{width:100%;margin-top:7px;padding:8px 12px;border-radius:8px;border:1px dashed rgba(240,200,140,.25);background:#0F0B07;color:#F4EAD8;font-family:'Tajawal',sans-serif;font-size:12.5px;display:none}"
    + ".bgrow input.on{display:block}"
    + "#bgEmpty{text-align:center;color:#A08A6A;padding:20px 0}"
    + "#bgEmpty a,#bgEmpty button{display:inline-block;margin:10px 6px 0;color:#F0A93C;background:none;cursor:pointer;text-decoration:none;border:1px solid #A96A1C;border-radius:999px;padding:8px 20px;font-family:'El Messiri',serif;font-size:14px}"
    + "#bgHint{display:none;font-size:11.5px;color:#C9B592;margin:8px 2px 0}"
    + "#bgUpsell{margin:10px 0 2px}"
    + "#bgUpsell .ut{font-size:12px;color:#C9B592;margin-bottom:7px;font-family:'El Messiri',serif}"
    + "#bgUpsell .uc{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}"
    + "#bgUpsell .uc::-webkit-scrollbar{display:none}"
    + "#bgUpsell button{flex:0 0 auto;border:1px solid rgba(240,200,140,.25);background:#0F0B07;color:#F4EAD8;border-radius:999px;"
    + "padding:7px 14px;font-size:12px;cursor:pointer;font-family:'Tajawal',sans-serif}"
    + "#bgUpsell button b{color:#F0A93C;font-weight:600}"
    + "#bgModes{display:flex;gap:8px;margin:10px 0 4px}"
    + "#bgModes button{flex:1;border-radius:999px;padding:9px 0;font-family:'El Messiri',serif;font-size:14px;cursor:pointer;border:1px solid rgba(240,200,140,.25);background:transparent;color:#C9B592}"
    + "#bgModes button.on{background:linear-gradient(180deg,#F0A93C,#D98E2B);color:#201409;border-color:transparent;font-weight:700}"
    + "#bgDrawer .fld{width:100%;margin:5px 0;padding:11px 14px;border-radius:10px;border:1px solid rgba(240,200,140,.2);background:#0F0B07;color:#F4EAD8;font-family:'Tajawal',sans-serif;font-size:14px}"
    + "#bgDrawer .fld::placeholder{color:#9C8768}"
    + "#bgGps{display:flex;align-items:center;gap:8px;margin:2px 0 4px}"
    + "#bgGps button{border:1px dashed rgba(240,200,140,.35);background:transparent;color:#C9B592;border-radius:999px;padding:8px 16px;font-family:inherit;font-size:12.5px;cursor:pointer}"
    + "#bgGps button.ok{border-style:solid;border-color:rgba(79,203,107,.5);color:#9FDCA9}"
    + "#bgGps .gx{border:none;background:none;color:#A08A6A;cursor:pointer;font-size:14px;display:none}"
    + "#bgGps.has .gx{display:inline}"
    + "#bgGpsErr{font-size:11px;color:#E06A50;margin:-2px 2px 4px;display:none}"
    + "#bgTotal{display:flex;justify-content:space-between;align-items:baseline;margin:8px 2px 2px;font-family:'El Messiri',serif;font-size:16px}"
    + "#bgTotal b{color:#F0A93C;font-size:20px}"
    + "#bgTotal small{display:block;font-family:'Tajawal',sans-serif;font-size:10.5px;color:#A08A6A;font-weight:300;max-width:30ch}"
    + "#bgSend{display:block;text-align:center;margin-top:9px;border-radius:999px;padding:14px;background:linear-gradient(180deg,#2E9B47,#1E7C33);color:#fff;"
    + "font-family:'El Messiri',serif;font-size:16px;font-weight:700;text-decoration:none;box-shadow:0 14px 34px -12px rgba(30,124,51,.6)}"
    + "#bgSend[aria-disabled=true]{display:none}"
    + "#bgSent{display:none;margin-top:9px;padding:10px 14px;border-radius:12px;background:rgba(47,168,79,.12);border:1px solid rgba(79,203,107,.35);color:#9FDCA9;font-size:12.5px;text-align:center}"
    + "#bgSent button{margin-inline-start:8px;background:none;border:1px solid rgba(79,203,107,.5);border-radius:999px;color:#9FDCA9;padding:3px 12px;cursor:pointer;font-family:'El Messiri',serif;font-size:12px}"
    + "#bgAlt{display:flex;justify-content:center;gap:18px;margin-top:9px;font-size:12.5px}"
    + "#bgAlt a{color:#A08A6A;text-decoration:none}#bgAlt a:hover{color:#F0A93C}"
    + "#bgBar{position:fixed;bottom:14px;left:14px;right:14px;z-index:85;display:none;align-items:center;justify-content:space-between;gap:12px;"
    + "background:linear-gradient(180deg,#F0A93C,#D98E2B);color:#201409;border-radius:999px;padding:13px 22px;cursor:pointer;border:none;"
    + "font-family:'El Messiri',serif;font-size:15.5px;font-weight:700;box-shadow:0 18px 44px -10px rgba(240,169,60,.55)}"
    + "@media(min-width:700px){#bgBar{left:auto;right:auto;width:380px;margin-inline:auto;inset-inline:0}}"
    + "#bgBar.on{display:flex}"
    + "#bgBar .c{background:#201409;color:#F0A93C;border-radius:999px;min-width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;padding:0 7px}"
    + "body.bgbar-on #fab{opacity:0!important;pointer-events:none!important}"
    + "#fab .fab-opts{display:none!important}"
    + "body.bglock{overflow:hidden}"
    + ".madd{margin-inline-start:auto;border:1px solid #A96A1C;background:transparent;color:#F0A93C;border-radius:999px;"
    + "padding:5px 13px;font-family:'El Messiri',serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s;white-space:nowrap;display:inline-flex;align-items:center;gap:9px}"
    + ".madd:hover{background:#D98E2B;color:#201409}"
    + ".madd.instep{background:#D98E2B;color:#201409;padding:3px 8px}"
    + ".madd.instep .mq{min-width:16px;text-align:center;font-weight:700}"
    + ".madd.instep .mm,.madd.instep .mp2{width:24px;height:24px;border-radius:50%;background:rgba(32,20,9,.15);display:inline-flex;align-items:center;justify-content:center;font-size:15px}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- drawer DOM ---------- */
  var wrap = document.createElement("div");
  wrap.id = "bgDrawerWrap";
  wrap.innerHTML = '<div id="bgBack"></div>'
    + '<div id="bgDrawer" role="dialog" aria-modal="true" aria-label="' + T.cart + '">'
    + '<h3>🛒 ' + T.cart + '<button class="bgx" aria-label="' + T.close + '">✕</button></h3>'
    + '<div id="bgClosed">' + T.closedNow + '</div>'
    + '<div id="bgScroll"><div id="bgItems"></div><div id="bgHint">' + T.drinkHint + '</div><div id="bgUpsell"></div></div>'
    + '<div id="bgModes" role="group"><button type="button" data-m="delivery">' + T.delivery + '</button><button type="button" data-m="pickup">' + T.pickup + '</button></div>'
    + '<input class="fld" id="bgName" type="text" placeholder="' + T.name + '" aria-label="' + T.name + '" autocomplete="name" />'
    + '<input class="fld" id="bgArea" type="text" placeholder="' + T.area + '" aria-label="' + T.area + '" autocomplete="street-address" />'
    + '<div id="bgGps"><button type="button" id="bgGpsBtn">' + T.gps + '</button><button type="button" class="gx" aria-label="' + T.removeLoc + '">' + T.remove + '</button></div>'
    + '<div id="bgGpsErr">' + T.gpsErr + '</div>'
    + '<input class="fld" id="bgNote" type="text" placeholder="' + T.note + '" aria-label="' + T.note + '" />'
    + '<div id="bgTotal"><span>' + T.total + '<small>' + T.totalNote + '</small></span><b id="bgSum"></b></div>'
    + '<a id="bgSend" href="#" target="_blank" rel="noopener">' + T.send + '</a>'
    + '<div id="bgSent">' + T.sent + '<button id="bgClear" type="button">' + T.clear + '</button></div>'
    + '<div id="bgAlt"><a href="' + TALABAT + '" target="_blank" rel="noopener">' + T.talabat + '</a>'
    + '<a href="tel:+97125858495" dir="ltr">' + T.call + '</a></div>'
    + '</div>';
  document.body.appendChild(wrap);

  var bar = document.createElement("button");
  bar.id = "bgBar"; bar.type = "button";
  bar.setAttribute("aria-label", T.viewCart);
  bar.innerHTML = '<span>🛒 ' + T.viewCart + '</span><span><span class="c" id="bgBarC"></span> <b id="bgBarT"></b></span>';
  document.body.appendChild(bar);

  var $ = function (s) { return wrap.querySelector(s); };
  var itemsEl = $("#bgItems"), upsellEl = $("#bgUpsell"), sumEl = $("#bgSum"),
      nameEl = $("#bgName"), areaEl = $("#bgArea"), noteEl = $("#bgNote"),
      sendEl = $("#bgSend"), sentEl = $("#bgSent"), hintEl = $("#bgHint"),
      closedEl = $("#bgClosed"),
      gpsRow = $("#bgGps"), gpsBtn = $("#bgGpsBtn"), gpsX = gpsRow.querySelector(".gx"), gpsErr = $("#bgGpsErr");
  nameEl.value = cust.name || ""; areaEl.value = cust.area || ""; noteEl.value = cust.note || "";

  function gpsUI() {
    var has = !!(cust.loc && cust.loc.lat);
    gpsRow.classList.toggle("has", has);
    gpsBtn.classList.toggle("ok", has);
    gpsBtn.textContent = has ? T.gpsOk + " (" + T.gpsAcc + " ±" + Math.round(cust.loc.acc || 0) + (EN ? "m)" : "م)") : T.gps;
  }
  gpsUI();

  /* ---------- rendering ---------- */
  function ref() {
    return "#B-" + Date.now().toString(36).slice(-3).toUpperCase() + Math.floor(Math.random() * 36).toString(36).toUpperCase();
  }
  var curRef = ref();

  function drinksUpsell() {
    var cats = menuData(), picks = [];
    cats.forEach(function (c) {
      if (/عصائر|موهيتو|juice|mojito|drink/i.test(c.cat))
        c.items.forEach(function (it) { if (!state[it.id]) picks.push(it); });
    });
    picks.sort(function (a, b) { return a.price - b.price; });
    return picks.slice(0, 3);
  }
  function hasMeal() {
    for (var id in state) { var it = findItem(id); if (it && /وجبة|meal/i.test(it.name)) return true; }
    return false;
  }

  function render() {
    purgeGhosts();
    var ids = Object.keys(state).filter(function (k) { return state[k] > 0; });
    if (!ids.length) {
      var last = lsGet("bgcart-last", null);
      itemsEl.innerHTML = '<div id="bgEmpty">' + T.empty + '<br/>'
        + '<a href="#menu">' + T.browse + '</a>'
        + (last && Object.keys(last.state || {}).length ? '<button id="bgReorder" type="button">' + T.reorder + '</button>' : '')
        + '</div>';
    } else {
      itemsEl.innerHTML = ids.map(function (id) {
        var it = findItem(id); if (!it) return "";
        var hasNote = !!(notes[id] && notes[id].trim());
        return '<div class="bgrow" data-id="' + id + '"><div class="r1">'
          + '<button type="button" class="bgnotebtn' + (hasNote ? " has" : "") + '" aria-label="' + T.noteBtn + '">✎</button>'
          + '<div class="n">' + it.name + '</div>'
          + '<div class="bgq"><button type="button" data-a="minus" aria-label="' + T.dec + '">−</button><span aria-live="polite">' + num(state[id]) + '</span><button type="button" data-a="plus" aria-label="' + T.inc + '">+</button></div>'
          + '<div class="p">' + num(it.price * state[id]) + " " + T.currency + '</div></div>'
          + '<input type="text" class="' + (hasNote ? "on" : "") + '" placeholder="' + T.itemNote + '" aria-label="' + T.itemNote + '" value="' + (notes[id] || "").replace(/"/g, "&quot;") + '" />'
          + '</div>';
      }).join("");
    }
    hintEl.style.display = (ids.length && hasMeal() && !noteEl.value.trim()) ? "block" : "none";
    var ups = ids.length ? drinksUpsell() : [];
    upsellEl.innerHTML = ups.length
      ? '<div class="ut">' + T.upsell + '</div><div class="uc">' + ups.map(function (it) {
          return '<button type="button" data-up="' + it.id + '">' + it.name + ' · <b>' + num(it.price) + " " + T.currency + '</b></button>';
        }).join("") + "</div>"
      : "";
    sumEl.textContent = num(total()) + " " + T.currency;
    wrap.querySelectorAll("#bgModes button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.m === cust.mode);
      b.setAttribute("aria-pressed", b.dataset.m === cust.mode ? "true" : "false");
    });
    areaEl.style.display = cust.mode === "delivery" ? "" : "none";
    gpsRow.style.display = cust.mode === "delivery" ? "" : "none";
    gpsErr.style.display = "none"; gpsUI();
    sendEl.setAttribute("aria-disabled", ids.length ? "false" : "true");   // الـCSS يخفيه عند الفراغ
    sentEl.style.display = sentFlag ? "block" : "none";
    closedEl.style.display = isOpenNow() ? "none" : "block";
    syncBar(); syncSteppers(); compose();
  }

  function compose() {
    var L = [T.msgTitle, T.msgRef + ": " + curRef, "———————————"];
    var i = 0;
    for (var id in state) {
      if (state[id] < 1) continue;
      var it = findItem(id); if (!it) continue;
      i++;
      L.push(i + ") " + state[id] + "× " + it.name + " = " + (it.price * state[id]) + " " + T.currency);
      if (notes[id] && notes[id].trim()) L.push("   ✎ " + notes[id].trim());
    }
    L.push("———————————");
    L.push(T.msgTotal + ": *" + total() + " " + T.currency + "*");
    L.push((cust.mode === "delivery" ? "🛵 " + T.delivery : "🏠 " + T.pickup)
      + (cust.mode === "delivery" && areaEl.value.trim() ? " — " + T.msgArea + ": " + areaEl.value.trim() : ""));
    if (cust.mode === "delivery" && cust.loc && cust.loc.lat)
      L.push(T.msgMap + ": https://maps.google.com/?q=" + cust.loc.lat.toFixed(6) + "," + cust.loc.lng.toFixed(6));
    if (nameEl.value.trim()) L.push(T.msgName + ": " + nameEl.value.trim());
    if (noteEl.value.trim()) L.push(T.msgNote + ": " + noteEl.value.trim());
    L.push(T.msgFoot);
    sendEl.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(L.join("\n"));
  }

  function syncBar() {
    var c = count();
    bar.classList.toggle("on", c > 0);
    document.body.classList.toggle("bgbar-on", c > 0);
    var fabMainB = document.querySelector("#fab .fab-main");
    if (fabMainB) fabMainB.tabIndex = c > 0 ? -1 : 0;    // لا فوكس على زر مخفي
    if (c > 0) {
      document.getElementById("bgBarC").textContent = num(c);
      document.getElementById("bgBarT").textContent = num(total()) + " " + T.currency;
    }
  }

  function stepperHTML(q) { return '<span class="mm" aria-hidden="true">−</span><span class="mq">' + num(q) + '</span><span class="mp2" aria-hidden="true">+</span>'; }
  function syncSteppers(root) {
    (root || document).querySelectorAll("#menuGrid .madd").forEach(function (b) {
      var q = state[b.dataset.id] || 0;
      if (q > 0) { b.classList.add("instep"); b.innerHTML = stepperHTML(q); b.setAttribute("aria-label", T.inc); }
      else { b.classList.remove("instep"); b.textContent = T.add; b.removeAttribute("aria-label"); }
    });
  }

  /* ---------- الفتح/الإغلاق مع قفل التمرير وإدارة الفوكس ---------- */
  var lastFocus = null;
  function lock(on) {
    document.body.classList.toggle("bglock", on);
    try { if (window.lenis) on ? window.lenis.stop() : window.lenis.start(); } catch (e) {}
  }
  function trapFocus(e) {
    if (e.key !== "Tab") return;
    var f = wrap.querySelectorAll("button,a[href],input,[tabindex]:not([tabindex='-1'])");
    var vis = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
    if (!vis.length) return;
    var first = vis[0], last = vis[vis.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function open() {
    lastFocus = document.activeElement;
    render(); wrap.classList.add("on"); lock(true);
    wrap.addEventListener("keydown", trapFocus);
    wrap.querySelector(".bgx").focus();
    track("view_cart");
  }
  function close() {
    wrap.classList.remove("on"); lock(false);
    wrap.removeEventListener("keydown", trapFocus);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }

  /* ---------- events ---------- */
  $("#bgBack").addEventListener("click", close);
  wrap.querySelector(".bgx").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && wrap.classList.contains("on")) close(); });
  bar.addEventListener("click", open);

  itemsEl.addEventListener("click", function (e) {
    var row = e.target.closest(".bgrow");
    var qb = e.target.closest(".bgq button");
    if (qb && row) {
      var id = row.dataset.id;
      state[id] = (state[id] || 0) + (qb.dataset.a === "plus" ? 1 : -1);
      if (state[id] < 1) { delete state[id]; delete notes[id]; }
      save(); render(); return;
    }
    var nb = e.target.closest(".bgnotebtn");
    if (nb && row) { var inp = row.querySelector("input"); inp.classList.toggle("on"); if (inp.classList.contains("on")) inp.focus(); }
    var re = e.target.closest("#bgReorder");
    if (re) {
      var last = lsGet("bgcart-last", null);
      if (last) { state = last.state || {}; notes = last.notes || {}; sentFlag = false; curRef = ref(); save(); render(); track("reorder"); }
    }
    if (e.target.closest("#bgEmpty a")) close();
  });
  itemsEl.addEventListener("input", function (e) {
    var row = e.target.closest(".bgrow");
    if (row && e.target.tagName === "INPUT") {
      notes[row.dataset.id] = e.target.value;
      row.querySelector(".bgnotebtn").classList.toggle("has", !!e.target.value.trim());
      save(); compose();
    }
  });
  upsellEl.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-up]");
    if (b) { add(b.dataset.up); render(); }
  });
  wrap.querySelector("#bgModes").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    cust.mode = b.dataset.m; save(); render();
  });
  [nameEl, areaEl, noteEl].forEach(function (el) {
    el.addEventListener("input", function () {
      cust.name = nameEl.value; cust.area = areaEl.value; cust.note = noteEl.value;
      hintEl.style.display = (count() && hasMeal() && !noteEl.value.trim()) ? "block" : "none";
      save(); compose();
    });
  });

  gpsBtn.addEventListener("click", function () {
    if (cust.loc && cust.loc.lat) return;
    if (!navigator.geolocation) { gpsErr.style.display = "block"; return; }
    gpsBtn.textContent = T.gpsWait; gpsErr.style.display = "none";
    navigator.geolocation.getCurrentPosition(function (p) {
      cust.loc = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, ts: Date.now() };
      save(); gpsUI(); compose(); track("gps_attached");
    }, function () {
      gpsErr.style.display = "block"; gpsUI();
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });
  gpsX.addEventListener("click", function () { delete cust.loc; save(); gpsUI(); compose(); });

  sendEl.addEventListener("click", function (e) {
    if (!count()) { e.preventDefault(); return; }           // حارس السلة الفارغة
    lsSet("bgcart-last", { state: state, notes: notes, ts: Date.now() });
    lsSet("bgcart-sent", Date.now());                       // تُؤرشف وتُفرَّغ في الزيارة القادمة
    sentFlag = true;
    track("begin_checkout", { ref: curRef, items: count() });
    setTimeout(function () { sentEl.style.display = "block"; }, 600);
  });
  $("#bgClear").addEventListener("click", function () {
    state = {}; notes = {}; sentFlag = false; curRef = ref();
    try { localStorage.removeItem("bgcart-sent"); } catch (e2) {}
    save(); render();
  });

  function add(id) {
    if (!findItem(id) && menuData().length) return;         // لا تضف صنفاً غير موجود
    state[id] = (state[id] || 0) + 1;
    save(); syncBar(); syncSteppers();
    track("add_to_cart", { item: String(id) });
  }

  window.BGCART = { add: add, open: open, close: close, t: T, count: count, find: findItem, menu: menuData };

  /* الزر العائم → الدرج (يظهر فقط عندما السلة فارغة) */
  var fabMain = document.querySelector("#fab .fab-main");
  if (fabMain) fabMain.addEventListener("click", function (e) { e.stopPropagation(); open(); });

  /* زر البطل → أضف السماش وافتح */
  var hero = document.querySelector("#hero .hero-order");
  if (hero) hero.addEventListener("click", function (e) { e.preventDefault(); add("smash"); open(); });

  /* بطاقات الأبطال: إضافة (مع ملاحظة مطبخ اختيارية data-cart-note="id:نص|id:نص") وفتح الدرج */
  document.querySelectorAll("[data-cart-add]").forEach(function (el) {
    function go() {
      el.dataset.cartAdd.split(",").forEach(function (id) { add(id.trim()); });
      (el.dataset.cartNote || "").split("|").forEach(function (pair) {
        var ix = pair.indexOf(":");
        if (ix > 0) {
          var nid = pair.slice(0, ix).trim(), txt = pair.slice(ix + 1).trim();
          if (txt && !(notes[nid] || "").trim()) { notes[nid] = txt; save(); }
        }
      });
      open();
    }
    el.addEventListener("click", go);
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    el.style.cursor = "pointer";
  });

  /* .js-order → افتح الدرج */
  document.querySelectorAll(".js-order").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });

  /* أزرار المنيو: إضافة + عدّاد (يدعم الكيبورد: Enter على العدّاد = زيادة) */
  var grid = document.getElementById("menuGrid");
  if (grid) {
    grid.addEventListener("click", function (e) {
      var b = e.target.closest(".madd"); if (!b) return;
      var id = b.dataset.id;
      if (b.classList.contains("instep")) {
        if (e.target.closest(".mm")) { state[id] = (state[id] || 0) - 1; if (state[id] < 1) { delete state[id]; delete notes[id]; } save(); }
        else { state[id] = (state[id] || 0) + 1; save(); track("add_to_cart", { item: id }); }
      } else { add(id); }
      syncBar(); syncSteppers();
    });
    new MutationObserver(function () { syncSteppers(grid); }).observe(grid, { childList: true });
    syncSteppers(grid);
  }

  syncBar();
})();
