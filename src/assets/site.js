(() => {
  const body = document.body, hdr = document.getElementById("hdr");

  // Scroll-back header
  let last = scrollY;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle("scrolled", y > 10);
    if (!body.classList.contains("menu-open")) hdr.classList.toggle("hide", y > last && y > 200);
    last = y;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Mobile menu
  const burger = document.querySelector(".burger");
  burger.addEventListener("click", () => {
    const open = body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
  });

  // Lightbox
  const lb = document.getElementById("lb");
  const tiles = [...document.querySelectorAll(".tile")];
  if (tiles.length) {
    const img = lb.querySelector("img"), cap = lb.querySelector("figcaption");
    let i = 0;
    const show = (n) => {
      i = (n + tiles.length) % tiles.length;
      const t = tiles[i];
      img.src = t.dataset.full; img.alt = t.querySelector("img").alt;
      cap.textContent = t.closest(".item").querySelector("figcaption")?.textContent || "";
    };
    const open = (n) => { show(n); lb.hidden = false; body.style.overflow = "hidden"; lb.querySelector(".lb-x").focus(); };
    const close = () => { lb.hidden = true; body.style.overflow = ""; tiles[i].focus(); };
    tiles.forEach((t, n) => t.addEventListener("click", (e) => { e.preventDefault(); open(n); }));
    lb.querySelector(".lb-x").onclick = close;
    lb.querySelector(".lb-prev").onclick = () => show(i - 1);
    lb.querySelector(".lb-next").onclick = () => show(i + 1);
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "FIGURE") close(); });
    addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(i - 1); else if (e.key === "ArrowRight") show(i + 1);
    });
    let sx = null;
    lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); sx = null; });
  }

  // Contact form (FormSubmit). Errors are shown to the visitor with a direct-email fallback — never a fake "sent".
  const modal = document.getElementById("form-modal");
  if (modal) {
    const form = document.getElementById("contact-form"), status = form.querySelector(".form-status");
    const openBtn = document.getElementById("open-form");
    const close = () => { modal.hidden = true; body.style.overflow = ""; };
    openBtn?.addEventListener("click", () => { modal.hidden = false; body.style.overflow = "hidden"; form.querySelector("input").focus(); });
    modal.querySelector(".modal-x").onclick = close;
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status";
      if (!form.checkValidity()) { status.textContent = "Please fill in every field with a valid email."; status.classList.add("err"); form.reportValidity(); return; }
      const btn = form.querySelector("[type=submit]"); btn.disabled = true; status.textContent = "Sending…";
      const fallback = form.action.split("/ajax/")[1];
      try {
        const res = await fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || String(data.success) !== "true") throw new Error(data.message || `HTTP ${res.status}`);
        form.reset(); status.textContent = "Thank you! Your message has been sent.";
      } catch (err) {
        console.error("Contact form failed:", err);
        status.classList.add("err");
        status.innerHTML = `Sorry, the message could not be sent (${String(err.message).replace(/</g, "&lt;")}). Please email <a href="mailto:${fallback}">${fallback}</a> directly.`;
      } finally { btn.disabled = false; }
    });
  }
})();
