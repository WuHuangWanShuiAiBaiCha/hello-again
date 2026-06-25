(() => {
  const pages = [
    { href: "../Ipad01/Ipad01.html", label: "iPad mini" },
    { href: "../Ipad02/Ipad02.html", label: "iPad Air" },
    { href: "../Ipad03/Ipad03.html", label: "iPad Pro 2017" },
    { href: "../Ipad04/Ipad04.html", label: "iPad Pro 2021" },
    { href: "../Ipad04/Ipad04-2.html", label: "iPad Pro 2021 Gallery" },
  ];

  const pageUrls = pages.map((page) => new URL(page.href, window.location.href));
  const currentIndex = Math.max(
    0,
    pageUrls.findIndex((url) => url.pathname === window.location.pathname)
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
    nav.className = "ipad-series-nav";
    nav.setAttribute("aria-label", "iPad pages");

    const home = document.createElement("a");
    home.className = "ipad-series-nav__home";
    home.href = "../../../index.html";
    home.textContent = "Home";
    nav.append(home);

    const prev = document.createElement("button");
    prev.className = "ipad-series-nav__arrow ipad-series-nav__arrow--prev";
    prev.type = "button";
    prev.setAttribute("aria-label", "上一页");
    prev.textContent = "‹";
    prev.disabled = currentIndex === 0;
    prev.addEventListener("click", () => goTo(currentIndex - 1));
    nav.append(prev);

    const next = document.createElement("button");
    next.className = "ipad-series-nav__arrow ipad-series-nav__arrow--next";
    next.type = "button";
    next.setAttribute("aria-label", "下一页");
    next.textContent = "›";
    next.disabled = currentIndex === pages.length - 1;
    next.addEventListener("click", () => goTo(currentIndex + 1));
    nav.append(next);

    const dots = document.createElement("div");
    dots.className = "ipad-series-nav__dots";
    pages.forEach((page, index) => {
      const dot = document.createElement("a");
      dot.className = "ipad-series-nav__dot";
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
    const absX = Math.abs(event.deltaX);
    const absY = Math.abs(event.deltaY);

    if (wheelLock || absX < 56 || absX <= absY * 1.4) {
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
    if (!touch) {
      return;
    }

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    if (Math.abs(diffX) < 52 || Math.abs(diffX) < Math.abs(diffY) * 1.15) {
      return;
    }

    diffX < 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  }

  function handlePlaceholderLink(event) {
    const link = event.target.closest?.("a[href]");
    if (!link) {
      return;
    }

    const href = link.getAttribute("href")?.trim();
    if (href === "#" || href === "") {
      event.preventDefault();
    }
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
    document.addEventListener("click", handlePlaceholderLink, { capture: true });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("wheel", handleHorizontalWheel, { passive: true });
  }

  let booted = false;

  function boot() {
    if (booted || !document.body) {
      return;
    }

    booted = true;
    createNav();
    bindEvents();

    window.HelloAgain = window.HelloAgain || {};
    window.HelloAgain.ipadPages = {
      next: () => goTo(currentIndex + 1),
      prev: () => goTo(currentIndex - 1),
      currentIndex,
      pages,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
