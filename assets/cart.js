/* برجراتو — سلة واتساب V2 (أنماط عالمية: شريط سفلي دائم، عدّادات على البطاقات،
   رقم طلب مرجعي، مكمّلات، ملاحظات، إعادة الطلب، حفظ بيانات الزبون، قفل التمرير، أحداث قياس) */
(function () {
  "use strict";
  var EN = (document.documentElement.lang || "ar") === "en";
  var WA = "971505882658";
  var TALABAT = EN
    ? "https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762"
    : "https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762";

  var T = EN ? {
    add: "+ Add", cart: "Your order", empty: "Your basket is empty",
    browse: "Browse the menu", reorder: "🔁 Repeat my last order",
    send: "Send order via WhatsApp", total: "Estimated total",
    totalNote: "menu prices — restaurant confirms total & any delivery fee",
    delivery: "Delivery", pickup: "Pickup", name: "Your name",
    area: "Area / address (for delivery)", note: "Order notes (optional)",
    itemNote: "Item note — e.g. no onions", talabat: "or order via Talabat",
    call: "or call 02 585 84 95", close: "Close", clear: "New basket",
    upsell: "Completes your order 👌",
    sent: "Sent? The restaurant will confirm shortly on WhatsApp.",
    viewCart: "View basket", msgTitle: "*New order — Burgerato*",
    msgRef: "Order ref", msgTotal: "Estimated total", msgName: "Name",
    msgArea: "Area/Address", msgNote: "Notes",
    msgFoot: "(official menu prices — restaurant confirms total & delivery fee)",
    currency: "AED", items: "items"
  } : {
    add: "+ أضف", cart: "طلبك", empty: "سلتك فارغة",
    browse: "تصفّح المنيو", reorder: "🔁 أعد طلبي السابق",
    send: "أرسل الطلب عبر واتساب", total: "المجموع التقريبي",
    totalNote: "أسعار المنيو الرسمية — يؤكد المطعم الإجمالي وأي رسوم توصيل",
    delivery: "توصيل", pickup: "استلام من الفرع", name: "اسمك",
    area: "المنطقة / العنوان (للتوصيل)", note: "ملاحظات للطلب (اختياري)",
    itemNote: "ملاحظة الصنف — مثال: بدون بصل", talabat: "أو اطلب عبر طلبات",
    call: "أو اتصل 02 585 84 95", close: "إغلاق", clear: "سلة جديدة",
    upsell: "يكمّل طلبك 👌",
    sent: "أرسلت الطلب؟ سيؤكده المطعم سريعاً في واتساب.",
    viewCart: "عرض السلة", msgTitle: "*طلب جديد — برجراتو* 🍔",
    msgRef: "رقم الطلب", msgTotal: "المجموع التقريبي", msgName: "الاسم",
    msgArea: "المنطقة/العنوان", msgNote: "ملاحظات",
    msgFoot: "(أسعار المنيو الرسمية — يؤكد المطعم الإجمالي ورسوم التوصيل)",
    currency: "د.إ", items: "أصناف"
  };
  var AR_D = "٠١٢٣٤٥٦٧٨٩";
  function num(n) { n = String(n); return EN ? n : n.replace(/\d/g, function (d) { return AR_D[+d]; }); }

  var SMASH = { id: "smash", name: EN ? "Smash Burgerato Meal" : "وجبة سماش برجراتو", price: 32 };
  function menuData() { try { return (EN ? BURGERATO_MENU_EN : BURGERATO_MENU) || []; } catch (e) { return []; } }
  function findItem(id) {
    if (String(id) === "smash") return SMASH;
    var cats = menuData();
    for (var i = 0; i < cats.length; i++)
      for (var j = 0; j < cats[i].items.length; j++)
        if (String(cats[i].items[j].id) === String(id)) return cats[i].items[j];
    return null;
  }

  /* ---------- state ---------- */
  function lsGet(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var state = lsGet("bgcart", {});
  var notes = lsGet("bgcart-notes", {});
  var cust = lsGet("bgcart-cust", { name: "", area: "", mode: "delivery", note: "" });
  var sentFlag = false;
  function save() { lsSet("bgcart", state); lsSet("bgcart-notes", notes); lsSet("bgcart-cust", cust); }
  function count() { var c = 0; for (var k in state) c += state[k]; return c; }
  function total() { var t = 0; for (var k in state) { var it = findItem(k); if (it) t += it.price * state[k]; } return t; }
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
    + "#bgDrawer .bgx{background:none;border:none;color:#8F7B5E;font-size:22px;cursor:pointer;line-height:1;padding:4px}"
    + "#bgScroll{overflow-y:auto;flex:1;min-height:40px;overscroll-behavior:contain}"
    + ".bgrow{padding:9px 0;border-bottom:1px solid rgba(240,200,140,.1)}"
    + ".bgrow .r1{display:flex;align-items:center;gap:10px}"
    + ".bgrow .n{flex:1;font-size:13.5px;line-height:1.5}"
    + ".bgrow .p{font-family:'El Messiri',serif;color:#F0A93C;font-size:14px;white-space:nowrap}"
    + ".bgq{display:flex;align-items:center;gap:7px}"
    + ".bgq button{width:29px;height:29px;border-radius:50%;border:1px solid rgba(240,200,140,.3);background:transparent;color:#F0A93C;font-size:16px;cursor:pointer}"
    + ".bgq span{min-width:17px;text-align:center;font-weight:600}"
    + ".bgnotebtn{background:none;border:none;color:#8F7B5E;cursor:pointer;font-size:14px;padding:2px 4px}"
    + ".bgnotebtn.has{color:#F0A93C}"
    + ".bgrow input{width:100%;margin-top:7px;padding:8px 12px;border-radius:8px;border:1px dashed rgba(240,200,140,.25);background:#0F0B07;color:#F4EAD8;font-family:'Tajawal',sans-serif;font-size:12.5px;display:none}"
    + ".bgrow input.on{display:block}"
    + "#bgEmpty{text-align:center;color:#8F7B5E;padding:20px 0}"
    + "#bgEmpty a,#bgEmpty button{display:inline-block;margin:10px 6px 0;color:#F0A93C;background:none;cursor:pointer;text-decoration:none;border:1px solid #A96A1C;border-radius:999px;padding:8px 20px;font-family:'El Messiri',serif;font-size:14px}"
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
    + "#bgDrawer .fld::placeholder{color:#6E5C4B}"
    + "#bgTotal{display:flex;justify-content:space-between;align-items:baseline;margin:8px 2px 2px;font-family:'El Messiri',serif;font-size:16px}"
    + "#bgTotal b{color:#F0A93C;font-size:20px}"
    + "#bgTotal small{display:block;font-family:'Tajawal',sans-serif;font-size:10.5px;color:#8F7B5E;font-weight:300;max-width:30ch}"
    + "#bgSend{display:block;text-align:center;margin-top:9px;border-radius:999px;padding:14px;background:linear-gradient(180deg,#4FCB6B,#2FA84F);color:#fff;"
    + "font-family:'El Messiri',serif;font-size:16px;font-weight:700;text-decoration:none;box-shadow:0 14px 34px -12px rgba(47,168,79,.55)}"
    + "#bgSent{display:none;margin-top:9px;padding:10px 14px;border-radius:12px;background:rgba(47,168,79,.12);border:1px solid rgba(79,203,107,.35);color:#9FDCA9;font-size:12.5px;text-align:center}"
    + "#bgSent button{margin-inline-start:8px;background:none;border:1px solid rgba(79,203,107,.5);border-radius:999px;color:#9FDCA9;padding:3px 12px;cursor:pointer;font-family:'El Messiri',serif;font-size:12px}"
    + "#bgAlt{display:flex;justify-content:center;gap:18px;margin-top:9px;font-size:12.5px}"
    + "#bgAlt a{color:#8F7B5E;text-decoration:none}#bgAlt a:hover{color:#F0A93C}"
    /* sticky bottom bar */
    + "#bgBar{position:fixed;bottom:14px;left:14px;right:14px;z-index:85;display:none;align-items:center;justify-content:space-between;gap:12px;"
    + "background:linear-gradient(180deg,#F0A93C,#D98E2B);color:#201409;border-radius:999px;padding:13px 22px;cursor:pointer;border:none;"
    + "font-family:'El Messiri',serif;font-size:15.5px;font-weight:700;box-shadow:0 18px 44px -10px rgba(240,169,60,.55)}"
    + "@media(min-width:700px){#bgBar{left:auto;right:auto;width:380px;margin-inline:auto;inset-inline:0}}"
    + "#bgBar.on{display:flex}"
    + "#bgBar .c{background:#201409;color:#F0A93C;border-radius:999px;min-width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;padding:0 7px}"
    + "body.bgbar-on #fab{opacity:0!important;pointer-events:none!important}"
    + "#fab .fab-opts{display:none!important}"
    + "body.bglock{overflow:hidden}"
    /* menu card steppers */
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
    + '<div id="bgScroll"><div id="bgItems"></div><div id="bgUpsell"></div></div>'
    + '<div id="bgModes"><button data-m="delivery">' + T.delivery + '</button><button data-m="pickup">' + T.pickup + '</button></div>'
    + '<input class="fld" id="bgName" type="text" placeholder="' + T.name + '" autocomplete="name" />'
    + '<input class="fld" id="bgArea" type="text" placeholder="' + T.area + '" autocomplete="street-address" />'
    + '<input class="fld" id="bgNote" type="text" placeholder="' + T.note + '" />'
    + '<div id="bgTotal"><span>' + T.total + '<small>' + T.totalNote + '</small></span><b id="bgSum"></b></div>'
    + '<a id="bgSend" href="#" target="_blank" rel="noopener">' + T.send + '</a>'
    + '<div id="bgSent">' + T.sent + '<button id="bgClear">' + T.clear + '</button></div>'
    + '<div id="bgAlt"><a href="' + TALABAT + '" target="_blank" rel="noopener">' + T.talabat + '</a>'
    + '<a href="tel:+97125858495">' + T.call + '</a></div>'
    + '</div>';
  document.body.appendChild(wrap);

  var bar = document.createElement("button");
  bar.id = "bgBar"; bar.type = "button";
  bar.innerHTML = '<span>🛒 ' + T.viewCart + '</span><span><span class="c" id="bgBarC"></span> <b id="bgBarT"></b></span>';
  document.body.appendChild(bar);

  var $ = function (s) { return wrap.querySelector(s); };
  var itemsEl = $("#bgItems"), upsellEl = $("#bgUpsell"), sumEl = $("#bgSum"),
      nameEl = $("#bgName"), areaEl = $("#bgArea"), noteEl = $("#bgNote"),
      sendEl = $("#bgSend"), sentEl = $("#bgSent");
  nameEl.value = cust.name || ""; areaEl.value = cust.area || ""; noteEl.value = cust.note || "";

  /* ---------- rendering ---------- */
  function ref() {
    var s = Date.now().toString(36).slice(-3).toUpperCase() + Math.floor(Math.random() * 36).toString(36).toUpperCase();
    return "#B-" + s;
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

  function render() {
    var ids = Object.keys(state).filter(function (k) { return state[k] > 0; });
    if (!ids.length) {
      var last = lsGet("bgcart-last", null);
      itemsEl.innerHTML = '<div id="bgEmpty">' + T.empty + '<br/>'
        + '<a href="#menu">' + T.browse + '</a>'
        + (last && Object.keys(last.state || {}).length ? '<button id="bgReorder">' + T.reorder + '</button>' : '')
        + '</div>';
    } else {
      itemsEl.innerHTML = ids.map(function (id) {
        var it = findItem(id); if (!it) return "";
        var hasNote = !!(notes[id] && notes[id].trim());
        return '<div class="bgrow" data-id="' + id + '"><div class="r1">'
          + '<button class="bgnotebtn' + (hasNote ? " has" : "") + '" title="' + T.itemNote + '">✎</button>'
          + '<div class="n">' + it.name + '</div>'
          + '<div class="bgq"><button data-a="minus">−</button><span>' + num(state[id]) + '</span><button data-a="plus">+</button></div>'
          + '<div class="p">' + num(it.price * state[id]) + " " + T.currency + '</div></div>'
          + '<input type="text" class="' + (hasNote ? "on" : "") + '" placeholder="' + T.itemNote + '" value="' + (notes[id] || "").replace(/"/g, "&quot;") + '" />'
          + '</div>';
      }).join("");
    }
    var ups = ids.length ? drinksUpsell() : [];
    upsellEl.innerHTML = ups.length
      ? '<div class="ut">' + T.upsell + '</div><div class="uc">' + ups.map(function (it) {
          return '<button data-up="' + it.id + '">' + it.name + ' · <b>' + num(it.price) + " " + T.currency + '</b></button>';
        }).join("") + "</div>"
      : "";
    sumEl.textContent = num(total()) + " " + T.currency;
    wrap.querySelectorAll("#bgModes button").forEach(function (b) { b.classList.toggle("on", b.dataset.m === cust.mode); });
    areaEl.style.display = cust.mode === "delivery" ? "" : "none";
    sentEl.style.display = sentFlag ? "block" : "none";
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
    if (nameEl.value.trim()) L.push(T.msgName + ": " + nameEl.value.trim());
    if (noteEl.value.trim()) L.push(T.msgNote + ": " + noteEl.value.trim());
    L.push(T.msgFoot);
    sendEl.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(L.join("\n"));
  }

  function syncBar() {
    var c = count();
    bar.classList.toggle("on", c > 0);
    document.body.classList.toggle("bgbar-on", c > 0);
    if (c > 0) {
      document.getElementById("bgBarC").textContent = num(c);
      document.getElementById("bgBarT").textContent = num(total()) + " " + T.currency;
    }
  }

  /* menu card steppers */
  function stepperHTML(q) { return '<span class="mm">−</span><span class="mq">' + num(q) + '</span><span class="mp2">+</span>'; }
  function syncSteppers(root) {
    (root || document).querySelectorAll("#menuGrid .madd").forEach(function (b) {
      var q = state[b.dataset.id] || 0;
      if (q > 0) { b.classList.add("instep"); b.innerHTML = stepperHTML(q); }
      else { b.classList.remove("instep"); b.textContent = T.add; }
    });
  }

  /* ---------- open/close with scroll lock ---------- */
  function lock(on) {
    document.body.classList.toggle("bglock", on);
    try { if (window.lenis) on ? window.lenis.stop() : window.lenis.start(); } catch (e) {}
  }
  function open() { render(); wrap.classList.add("on"); lock(true); track("view_cart"); }
  function close() { wrap.classList.remove("on"); lock(false); }

  /* ---------- events ---------- */
  $("#bgBack").addEventListener("click", close);
  wrap.querySelector(".bgx").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
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
    var br = e.target.closest("#bgEmpty a");
    if (br) close();
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
      save(); compose();
    });
  });
  sendEl.addEventListener("click", function () {
    lsSet("bgcart-last", { state: state, notes: notes, ts: Date.now() });
    sentFlag = true;
    track("begin_checkout", { ref: curRef, items: count() });
    setTimeout(function () { sentEl.style.display = "block"; }, 600);
  });
  $("#bgClear").addEventListener("click", function () {
    state = {}; notes = {}; sentFlag = false; curRef = ref(); save(); render();
  });

  function add(id) {
    state[id] = (state[id] || 0) + 1;
    save(); syncBar(); syncSteppers();
    track("add_to_cart", { item: String(id) });
  }

  window.BGCART = { add: add, open: open, close: close, t: T, count: count, find: findItem, menu: menuData };

  /* FAB main → drawer (يظهر فقط عندما السلة فارغة) */
  var fabMain = document.querySelector("#fab .fab-main");
  if (fabMain) fabMain.addEventListener("click", function (e) { e.stopPropagation(); open(); });

  /* hero order button → أضف السماش وافتح */
  var hero = document.querySelector("#hero .hero-order");
  if (hero) hero.addEventListener("click", function (e) { e.preventDefault(); add("smash"); open(); });

  /* .js-order → افتح الدرج */
  document.querySelectorAll(".js-order").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });

  /* أزرار المنيو: إضافة + عدّاد مباشر على البطاقة */
  var grid = document.getElementById("menuGrid");
  if (grid) {
    grid.addEventListener("click", function (e) {
      var b = e.target.closest(".madd"); if (!b) return;
      var id = b.dataset.id;
      if (b.classList.contains("instep")) {
        if (e.target.closest(".mm")) { state[id] = (state[id] || 0) - 1; if (state[id] < 1) delete state[id]; save(); }
        else if (e.target.closest(".mp2") || e.target.closest(".mq")) { state[id] = (state[id] || 0) + 1; save(); track("add_to_cart", { item: id }); }
      } else { add(id); }
      syncBar(); syncSteppers();
    });
    new MutationObserver(function () { syncSteppers(grid); }).observe(grid, { childList: true });
  }

  syncBar();
})();
