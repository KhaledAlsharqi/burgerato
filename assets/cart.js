/* برجراتو — سلة واتساب خفيفة: بلا دفع، بلا حسابات. تنتهي برسالة منسقة للمطعم. */
(function () {
  "use strict";
  var EN = (document.documentElement.lang || "ar") === "en";
  var WA = "971505882658";
  var TALABAT = EN
    ? "https://www.talabat.com/uae/restaurant/734212/burgerato-bani-yas-east?aid=1762"
    : "https://www.talabat.com/ar/uae/restaurant/734212/burgerato?aid=1762";

  var T = EN ? {
    add: "+ Add", cart: "Your order", empty: "Your basket is empty",
    browse: "Browse the menu", send: "Send order via WhatsApp",
    total: "Estimated total", totalNote: "final total confirmed by the restaurant",
    delivery: "Delivery", pickup: "Pickup", name: "Your name",
    area: "Area / address (for delivery)", talabat: "or order via Talabat",
    call: "or call 02 585 84 95", close: "Close",
    deliveryNote: "Delivered by the restaurant — fee depends on your area",
    pickupNote: "Pickup from the branch — Baniyas East",
    msgHi: "Hello Burgerato! My order:", msgTotal: "Estimated total",
    msgMode: "Method", msgName: "Name", msgArea: "Area/Address", currency: "AED"
  } : {
    add: "+ أضف", cart: "طلبك", empty: "سلتك فارغة",
    browse: "تصفّح المنيو", send: "أرسل الطلب عبر واتساب",
    total: "المجموع التقريبي", totalNote: "المجموع النهائي يؤكده المطعم",
    delivery: "توصيل", pickup: "استلام من الفرع", name: "اسمك",
    area: "المنطقة / العنوان (للتوصيل)", talabat: "أو اطلب عبر طلبات",
    call: "أو اتصل 02 585 84 95", close: "إغلاق",
    deliveryNote: "التوصيل عبر المطعم — تُحسب رسومه حسب المنطقة",
    pickupNote: "استلام من الفرع — بني ياس شرق",
    msgHi: "مرحبا برجراتو! 🍔 طلبي:", msgTotal: "المجموع التقريبي",
    msgMode: "الطريقة", msgName: "الاسم", msgArea: "المنطقة/العنوان", currency: "د.إ"
  };
  var AR_D = "٠١٢٣٤٥٦٧٨٩";
  function num(n) { n = String(n); return EN ? n : n.replace(/\d/g, function (d) { return AR_D[+d]; }); }

  var SMASH = { id: "smash", name: EN ? "Smash Burgerato Meal" : "وجبة سماش برجراتو", price: 32 };
  function menuData() {
    try { return (EN ? BURGERATO_MENU_EN : BURGERATO_MENU) || []; } catch (e) { return []; }
  }
  function findItem(id) {
    if (String(id) === "smash") return SMASH;
    var cats = menuData();
    for (var i = 0; i < cats.length; i++)
      for (var j = 0; j < cats[i].items.length; j++)
        if (String(cats[i].items[j].id) === String(id)) return cats[i].items[j];
    return null;
  }

  var state;
  try { state = JSON.parse(localStorage.getItem("bgcart") || "{}"); } catch (e) { state = {}; }
  var mode = localStorage.getItem("bgcart-mode") || "delivery";
  function save() { try { localStorage.setItem("bgcart", JSON.stringify(state)); localStorage.setItem("bgcart-mode", mode); } catch (e) {} }
  function count() { var c = 0; for (var k in state) c += state[k]; return c; }
  function total() { var t = 0; for (var k in state) { var it = findItem(k); if (it) t += it.price * state[k]; } return t; }

  /* ---------- styles ---------- */
  var css = ""
    + "#bgDrawerWrap{position:fixed;inset:0;z-index:90;display:none}"
    + "#bgDrawerWrap.on{display:block}"
    + "#bgBack{position:absolute;inset:0;background:rgba(5,3,2,.6);backdrop-filter:blur(3px)}"
    + "#bgDrawer{position:absolute;bottom:0;left:0;right:0;max-height:82vh;display:flex;flex-direction:column;"
    + "background:#14100A;border:1px solid rgba(240,200,140,.18);border-bottom:none;border-radius:18px 18px 0 0;"
    + "box-shadow:0 -30px 80px rgba(0,0,0,.6);padding:18px 18px 16px;color:#F4EAD8}"
    + "@media(min-width:700px){#bgDrawer{left:auto;right:auto;width:440px;margin-inline:auto;inset-inline:0}}"
    + "#bgDrawer h3{font-family:'El Messiri',serif;font-size:20px;margin:0 0 10px;display:flex;justify-content:space-between;align-items:center}"
    + "#bgDrawer .bgx{background:none;border:none;color:#8F7B5E;font-size:22px;cursor:pointer;line-height:1}"
    + "#bgItems{overflow-y:auto;flex:1;min-height:40px}"
    + ".bgrow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(240,200,140,.1)}"
    + ".bgrow .n{flex:1;font-size:13.5px;line-height:1.5}"
    + ".bgrow .p{font-family:'El Messiri',serif;color:#F0A93C;font-size:14px;white-space:nowrap}"
    + ".bgq{display:flex;align-items:center;gap:8px}"
    + ".bgq button{width:30px;height:30px;border-radius:50%;border:1px solid rgba(240,200,140,.3);background:transparent;color:#F0A93C;font-size:17px;cursor:pointer}"
    + ".bgq span{min-width:18px;text-align:center;font-weight:600}"
    + "#bgEmpty{text-align:center;color:#8F7B5E;padding:22px 0}"
    + "#bgEmpty a{display:inline-block;margin-top:10px;color:#F0A93C;text-decoration:none;border:1px solid #A96A1C;border-radius:999px;padding:8px 22px;font-family:'El Messiri',serif}"
    + "#bgModes{display:flex;gap:8px;margin:12px 0 4px}"
    + "#bgModes button{flex:1;border-radius:999px;padding:9px 0;font-family:'El Messiri',serif;font-size:14px;cursor:pointer;border:1px solid rgba(240,200,140,.25);background:transparent;color:#C9B592}"
    + "#bgModes button.on{background:linear-gradient(180deg,#F0A93C,#D98E2B);color:#201409;border-color:transparent;font-weight:700}"
    + "#bgNote{font-size:11.5px;color:#8F7B5E;margin:2px 2px 8px}"
    + "#bgDrawer input{width:100%;margin:5px 0;padding:11px 14px;border-radius:10px;border:1px solid rgba(240,200,140,.2);background:#0F0B07;color:#F4EAD8;font-family:'Tajawal',sans-serif;font-size:14px}"
    + "#bgDrawer input::placeholder{color:#6E5C4B}"
    + "#bgTotal{display:flex;justify-content:space-between;align-items:baseline;margin:10px 2px 2px;font-family:'El Messiri',serif;font-size:16px}"
    + "#bgTotal b{color:#F0A93C;font-size:20px}"
    + "#bgTotal small{display:block;font-family:'Tajawal',sans-serif;font-size:10.5px;color:#8F7B5E;font-weight:300}"
    + "#bgSend{display:block;text-align:center;margin-top:10px;border-radius:999px;padding:14px;background:linear-gradient(180deg,#4FCB6B,#2FA84F);color:#fff;"
    + "font-family:'El Messiri',serif;font-size:16px;font-weight:700;text-decoration:none;box-shadow:0 14px 34px -12px rgba(47,168,79,.55)}"
    + "#bgAlt{display:flex;justify-content:center;gap:18px;margin-top:10px;font-size:12.5px}"
    + "#bgAlt a{color:#8F7B5E;text-decoration:none}"
    + "#bgAlt a:hover{color:#F0A93C}"
    + "#fab .fab-opts{display:none!important}"
    + "#bgBadge{position:absolute;top:-7px;inset-inline-end:-7px;min-width:22px;height:22px;border-radius:999px;background:#C4502E;color:#fff;"
    + "font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 4px 10px rgba(0,0,0,.4)}"
    + ".madd{margin-inline-start:auto;border:1px solid #A96A1C;background:transparent;color:#F0A93C;border-radius:999px;"
    + "padding:5px 14px;font-family:'El Messiri',serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .3s;white-space:nowrap}"
    + ".madd:hover{background:#D98E2B;color:#201409}"
    + ".madd.done{background:#2FA84F;border-color:transparent;color:#fff}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- drawer DOM ---------- */
  var wrap = document.createElement("div");
  wrap.id = "bgDrawerWrap";
  wrap.innerHTML = '<div id="bgBack"></div>'
    + '<div id="bgDrawer" role="dialog" aria-modal="true" aria-label="' + T.cart + '">'
    + '<h3>🛒 ' + T.cart + '<button class="bgx" aria-label="' + T.close + '">✕</button></h3>'
    + '<div id="bgItems"></div>'
    + '<div id="bgModes"><button data-m="delivery">' + T.delivery + '</button><button data-m="pickup">' + T.pickup + '</button></div>'
    + '<div id="bgNote"></div>'
    + '<input id="bgName" type="text" placeholder="' + T.name + '" autocomplete="name" />'
    + '<input id="bgArea" type="text" placeholder="' + T.area + '" autocomplete="street-address" />'
    + '<div id="bgTotal"><span>' + T.total + '<small>' + T.totalNote + '</small></span><b id="bgSum"></b></div>'
    + '<a id="bgSend" href="#" target="_blank" rel="noopener">' + T.send + '</a>'
    + '<div id="bgAlt"><a href="' + TALABAT + '" target="_blank" rel="noopener">' + T.talabat + '</a>'
    + '<a href="tel:+97125858495">' + T.call + '</a></div>'
    + '</div>';
  document.body.appendChild(wrap);

  var $ = function (s) { return wrap.querySelector(s); };
  var itemsEl = $("#bgItems"), sumEl = $("#bgSum"), noteEl = $("#bgNote"),
      nameEl = $("#bgName"), areaEl = $("#bgArea"), sendEl = $("#bgSend");

  function render() {
    var ids = Object.keys(state).filter(function (k) { return state[k] > 0; });
    if (!ids.length) {
      itemsEl.innerHTML = '<div id="bgEmpty">' + T.empty + '<br/><a href="#menu">' + T.browse + '</a></div>';
    } else {
      itemsEl.innerHTML = ids.map(function (id) {
        var it = findItem(id); if (!it) return "";
        return '<div class="bgrow"><div class="n">' + it.name + '</div>'
          + '<div class="bgq"><button data-a="minus" data-id="' + id + '">−</button><span>' + num(state[id]) + '</span>'
          + '<button data-a="plus" data-id="' + id + '">+</button></div>'
          + '<div class="p">' + num(it.price * state[id]) + " " + T.currency + '</div></div>';
      }).join("");
    }
    sumEl.textContent = num(total()) + " " + T.currency;
    wrap.querySelectorAll("#bgModes button").forEach(function (b) { b.classList.toggle("on", b.dataset.m === mode); });
    noteEl.textContent = mode === "delivery" ? T.deliveryNote : T.pickupNote;
    areaEl.style.display = mode === "delivery" ? "" : "none";
    badge();
    compose();
  }

  function compose() {
    var lines = [T.msgHi];
    for (var id in state) {
      if (state[id] < 1) continue;
      var it = findItem(id); if (!it) continue;
      lines.push("- " + state[id] + "× " + it.name + " = " + (it.price * state[id]) + " " + T.currency);
    }
    lines.push(T.msgTotal + ": " + total() + " " + T.currency);
    lines.push(T.msgMode + ": " + (mode === "delivery" ? T.delivery : T.pickup));
    if (nameEl.value.trim()) lines.push(T.msgName + ": " + nameEl.value.trim());
    if (mode === "delivery" && areaEl.value.trim()) lines.push(T.msgArea + ": " + areaEl.value.trim());
    sendEl.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  function badge() {
    var main = document.querySelector("#fab .fab-main");
    if (!main) return;
    var b = document.getElementById("bgBadge");
    var c = count();
    if (!b) { b = document.createElement("span"); b.id = "bgBadge"; main.style.position = "relative"; main.appendChild(b); }
    b.style.display = c ? "flex" : "none";
    b.textContent = num(c);
  }

  function open() { render(); wrap.classList.add("on"); }
  function close() { wrap.classList.remove("on"); }

  /* ---------- events ---------- */
  $("#bgBack").addEventListener("click", close);
  wrap.querySelector(".bgx").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  itemsEl.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var id = b.dataset.id;
    state[id] = (state[id] || 0) + (b.dataset.a === "plus" ? 1 : -1);
    if (state[id] < 1) delete state[id];
    save(); render();
  });
  itemsEl.addEventListener("click", function (e) {
    var a = e.target.closest("a"); if (a) { close(); }
  });
  wrap.querySelector("#bgModes").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    mode = b.dataset.m; save(); render();
  });
  nameEl.addEventListener("input", compose);
  areaEl.addEventListener("input", compose);

  function add(id) { state[id] = (state[id] || 0) + 1; save(); badge(); }

  window.BGCART = { add: add, open: open, close: close, t: T, count: count, find: findItem, menu: menuData };

  /* FAB main → drawer */
  var fabMain = document.querySelector("#fab .fab-main");
  if (fabMain) fabMain.addEventListener("click", function (e) { e.stopPropagation(); open(); });

  /* hero order button → add smash + open */
  var hero = document.querySelector("#hero .hero-order");
  if (hero) hero.addEventListener("click", function (e) { e.preventDefault(); add("smash"); open(); });

  /* any element with .js-order → open drawer */
  document.querySelectorAll(".js-order").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });

  /* menu add buttons (delegated — rendered by initMenu) */
  var grid = document.getElementById("menuGrid");
  if (grid) grid.addEventListener("click", function (e) {
    var b = e.target.closest(".madd"); if (!b) return;
    add(b.dataset.id);
    b.classList.add("done"); b.textContent = "✓";
    setTimeout(function () { b.classList.remove("done"); b.textContent = T.add; }, 900);
  });

  badge();
})();
