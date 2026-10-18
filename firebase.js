// Firebase client configuration for the sorry- site.
// This web config is not a service-account secret. Keep Firestore rules restrictive.
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBdFADDci2DSbCzEOkOD3KE5YYLKkxfc60",
    authDomain: "all-in-a5f3b.firebaseapp.com",
    projectId: "all-in-a5f3b",
    storageBucket: "all-in-a5f3b.firebasestorage.app",
    messagingSenderId: "924508433076",
    appId: "1:924508433076:web:4cd108992dbfc45b9845e1"
  };

  try {
    if (!window.firebase) throw new Error("Firebase SDK did not load");
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const params = new URLSearchParams(location.search);
    const campaignId = (params.get("id") || "default").slice(0, 80);
    const sessionId = sessionStorage.getItem("sorrySessionId") ||
      (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2));
    sessionStorage.setItem("sorrySessionId", sessionId);

    // Local-only analytics work without changing Firestore rules. These records stay in this browser.
    function trackLocal(type, extra = {}) {
      try {
        const key = "sorryLocalEventsV1";
        const events = JSON.parse(localStorage.getItem(key) || "[]");
        events.push({ type: String(type).slice(0, 80), extra, time: new Date().toISOString(), campaignId, sessionId });
        localStorage.setItem(key, JSON.stringify(events.slice(-500)));
      } catch (error) {}
    }

    window.sorryFirebase = {
      db,
      campaignId,
      sessionId,
      track(type, extra = {}) {
        trackLocal(type, extra);
        return db.collection("sorryEvents").add({
          app: "sorry",
          campaignId,
          sessionId,
          type: String(type).slice(0, 80),
          extra,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          expiresAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 86400000))
        }).catch(error => console.warn("Sorry analytics unavailable; check Firestore rules.", error.code || error.message));
      }
    };

    window.sorryFirebase.track("link_opened", { path: location.pathname });
    window.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => {
          const active = document.querySelector("main.screen.active");
          window.sorryFirebase.track("button_click", {
            buttonId: button.id || "unknown",
            buttonText: (button.textContent || "").trim().slice(0, 100),
            page: active ? active.id : "unknown"
          });
        });
      });
      const screens = ["screen-1", "screen-2", "screen-sad", "screen-super-sad", "screen-3"];
      let lastTrackedPage = "";
      const trackActivePage = () => {
        const active = document.querySelector("main.screen.active");
        if (active && active.id !== lastTrackedPage) {
          lastTrackedPage = active.id;
          window.sorryFirebase.track("page_reached", { page: active.id });
        }
      };
      const observer = new MutationObserver(trackActivePage);
      screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el, { attributes: true, attributeFilter: ["class"] });
      });
      trackActivePage();
    });
  } catch (error) {
    console.warn("Firebase could not initialize.", error);
  }

  // Keep help UI available even when Firebase is blocked or rules reject writes.
  window.addEventListener("DOMContentLoaded", addSorryMessageUI, { once: true });

  function addSorryMessageUI() {
    if (document.getElementById("sorry-message-open")) return;
    const style = document.createElement("style");
    style.textContent = `
      #sorry-message-open{position:fixed;right:16px;top:14px;z-index:10001;border:0;border-radius:999px;padding:11px 15px;background:#7c58a6;color:#fff;font-weight:700;box-shadow:0 6px 22px #49315c30}
      #sorry-tools-fab{position:fixed;right:16px;bottom:18px;z-index:10001;width:48px;height:48px;border:0;border-radius:50%;background:#7c58a6;color:#fff;font-size:23px;box-shadow:0 6px 22px #49315c30}
      #sorry-tools-menu{position:fixed;right:16px;bottom:74px;z-index:10001;width:min(230px,calc(100vw - 32px));display:none;padding:9px;background:#fff8ff;color:#352642;border:1px solid #e5d6ed;border-radius:18px;box-shadow:0 12px 36px #49315c30}
      #sorry-tools-menu button{display:block;width:100%;text-align:left;border:0;border-radius:12px;padding:12px;background:transparent;color:#352642;font-weight:700}
      #sorry-tools-menu button:hover{background:#f0e5f5}
      #sorry-message-modal{position:fixed;inset:0;z-index:10002;background:#24172b80;display:none;align-items:center;justify-content:center;padding:18px;font-family:Quicksand,sans-serif}
      #sorry-message-modal .sm-card{width:min(420px,100%);background:#fff8ff;color:#352642;border-radius:22px;padding:20px;box-shadow:0 20px 60px #170d2470}
      #sorry-message-modal .sm-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
      #sorry-message-modal button{border:0;border-radius:999px;padding:10px 14px;font-weight:700;cursor:pointer}
      #sorry-message-modal .sm-close{background:#eee5f5;color:#352642}
      #sorry-message-modal textarea{box-sizing:border-box;width:100%;min-height:115px;margin:12px 0;padding:12px;border:1px solid #d7c8e5;border-radius:14px;font:inherit;resize:vertical}
      #sorry-message-modal .sm-send{background:#7c58a6;color:#fff;width:100%}
      #sorry-message-modal .sm-status{font-size:13px;min-height:18px;margin-top:8px}
    `;
    document.head.appendChild(style);
    const open = document.createElement("button");
    open.id = "sorry-message-open";
    open.type = "button";
    open.textContent = "💌 Contact me";
    open.hidden = !window.sorryContactUrl;
    document.body.appendChild(open);
    if (typeof window.applySorryContact === "function") {
      window.applySorryContact(window.sorryContactUrl, window.sorryContactLabel || "Contact me");
    }

    const fab = document.createElement("button");
    fab.id = "sorry-tools-fab";
    fab.type = "button";
    fab.setAttribute("aria-label", "More options");
    fab.textContent = "↑";
    document.body.appendChild(fab);
    const menu = document.createElement("div");
    menu.id = "sorry-tools-menu";
    menu.innerHTML = '<button type="button" data-action="create">✨ Create your own</button><button type="button" data-action="feedback">💬 Feedback</button><button type="button" data-action="close">✕ Close</button>';
    document.body.appendChild(menu);
    fab.addEventListener("click", () => { menu.style.display = menu.style.display === "block" ? "none" : "block"; });
    menu.addEventListener("click", event => {
      const action = event.target.closest("button")?.dataset.action;
      if (action === "create") location.href = new URL("admin.html", location.href).href;
      if (action === "feedback") window.open("https://github.com/mainakgarai007/sorry-/issues/new", "_blank", "noopener");
      if (action === "close") menu.style.display = "none";
    });

    const modal = document.createElement("div");
    modal.id = "sorry-message-modal";
    modal.innerHTML = '<section class="sm-card" role="dialog" aria-modal="true" aria-labelledby="sm-title"><div class="sm-head"><strong id="sm-title">Send a message 💌</strong><button class="sm-close" type="button" aria-label="Close">×</button></div><p>Leave a message for the creator. Replies are not available here.</p><textarea maxlength="1000" placeholder="Write your message..." aria-label="Your message"></textarea><button class="sm-send" type="button">Send message</button><div class="sm-status" role="status"></div></section>';
    document.body.appendChild(modal);
    const close = () => { modal.style.display = "none"; };
    open.addEventListener("click", () => {
      const target = window.sorryContactUrl;
      if (!target) return;
      if (window.sorryFirebase?.track) window.sorryFirebase.track("contact_button_clicked", { method: window.sorryContactLabel || "Contact" });
      const parsed = (() => { try { return new URL(target, location.href); } catch (e) { return null; } })();
      if (parsed && ["http:", "https:", "mailto:", "tel:", "sms:"].includes(parsed.protocol)) {
        // Same-tab navigation avoids mobile popup blockers.
        location.assign(parsed.href);
      }
    });
    modal.querySelector(".sm-close").addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
    modal.querySelector(".sm-send").addEventListener("click", async () => {
      const textarea = modal.querySelector("textarea");
      const status = modal.querySelector(".sm-status");
      const message = textarea.value.trim();
      if (!message) { status.textContent = "Write a message first."; return; }
      if (!window.sorryFirebase) { status.textContent = "Connection unavailable. Please try again later."; return; }
      const button = modal.querySelector(".sm-send");
      button.disabled = true;
      status.textContent = "Sending…";
      try {
        await window.sorryFirebase.db.collection("sorryMessages").add({
          app: "sorry",
          campaignId: window.sorryFirebase.campaignId,
          sessionId: window.sorryFirebase.sessionId,
          message: message.slice(0, 1000),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          expiresAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 86400000))
        });
        await window.sorryFirebase.track("message_sent");
        textarea.value = "";
        status.textContent = "Message sent 💜";
      } catch (error) {
        status.textContent = "Could not send. Firestore may need setup/rules.";
        console.warn("Message send failed.", error.code || error.message);
      } finally { button.disabled = false; }
    });
  }
})();