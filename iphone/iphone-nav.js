(() => {
  if (window.self !== window.top) {
    return;
  }

  const pages = [
    { href: "./index.html", label: "iPhone 4S" },
    { href: "./iphone6.html", label: "iPhone 6" },
    { href: "./iphonex.html", label: "iPhone X" },
    { href: "./iphone13pro.html", label: "iPhone 13 Pro" },
  ];

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const currentIndex = Math.max(
    0,
    pages.findIndex((page) => page.href.endsWith(currentFile))
  );
  let touchStartX = 0;
  let touchStartY = 0;
  let wheelLock = false;

  function goTo(index) {
    if (index < 0 || index >= pages.length || index === currentIndex) {
      return;
    }

    window.location.href = pages[index].href;
  }

  function createNav() {
    const nav = document.createElement("nav");
    nav.className = "iphone-series-nav";
    nav.setAttribute("aria-label", "iPhone pages");

    const home = document.createElement("a");
    home.className = "iphone-series-nav__home";
    home.href = "../index.html";
    home.textContent = "Home";
    nav.append(home);

    const prev = document.createElement("button");
    prev.className = "iphone-series-nav__arrow iphone-series-nav__arrow--prev";
    prev.type = "button";
    prev.setAttribute("aria-label", "上一页");
    prev.textContent = "‹";
    prev.disabled = currentIndex === 0;
    prev.addEventListener("click", () => goTo(currentIndex - 1));
    nav.append(prev);

    const next = document.createElement("button");
    next.className = "iphone-series-nav__arrow iphone-series-nav__arrow--next";
    next.type = "button";
    next.setAttribute("aria-label", "下一页");
    next.textContent = "›";
    next.disabled = currentIndex === pages.length - 1;
    next.addEventListener("click", () => goTo(currentIndex + 1));
    nav.append(next);

    const dots = document.createElement("div");
    dots.className = "iphone-series-nav__dots";
    pages.forEach((page, index) => {
      const dot = document.createElement("a");
      dot.className = "iphone-series-nav__dot";
      dot.href = page.href;
      dot.setAttribute("aria-label", page.label);
      if (index === currentIndex) {
        dot.classList.add("is-active");
        dot.setAttribute("aria-current", "page");
      }
      dots.append(dot);
    });
    nav.append(dots);

    document.body.append(nav);
  }

  function handleHorizontalWheel(event) {
    if (wheelLock || Math.abs(event.deltaX) < 36 || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.4) {
      return;
    }

    wheelLock = true;
    event.deltaX > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);

    window.setTimeout(() => {
      wheelLock = false;
    }, 980);
  }

  function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    if (Math.abs(diffX) < 52 || Math.abs(diffX) < Math.abs(diffY) * 1.15) {
      return;
    }

    diffX < 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  }

  function bindEvents() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        goTo(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        goTo(currentIndex + 1);
      }
    });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("wheel", handleHorizontalWheel, { passive: true });
  }

  function hydrateArchiveMedia() {
    document.querySelectorAll("video").forEach((video) => {
      if (video.currentSrc || video.getAttribute("src")) {
        return;
      }

      const src =
        video.dataset.srcSmall ||
        video.dataset.srcMedium ||
        video.dataset.srcLarge;
      if (!src) {
        return;
      }

      video.muted = true;
      video.playsInline = true;
      video.setAttribute("src", src);
      video.load();
      const playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(() => {});
      }
    });
  }

  let booted = false;

  function boot() {
    if (booted || !document.body) {
      return;
    }

    booted = true;
    hydrateArchiveMedia();
    createNav();
    bindEvents();
  }

  function scheduleBoot() {
    if (booted) {
      return;
    }

    if (document.body) {
      boot();
      return;
    }

    window.setTimeout(scheduleBoot, 50);
  }

  scheduleBoot();
  document.addEventListener("DOMContentLoaded", boot, { once: true });
})();
