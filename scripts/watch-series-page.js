(function () {
  window.HelloAgain = window.HelloAgain || {};

  document.addEventListener("DOMContentLoaded", () => {
    const refs = window.HelloAgain.createRefs();
    const seriesShell = window.HelloAgain.createSeriesShellController(refs);
    const frames = Array.from(document.querySelectorAll(".watch-frame"));
    const getWidth = () => window.HelloAgain.utils.viewportWidth();

    let wheelLockTimer = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    function getCurrentPanel() {
      if (!refs.seriesTrack) {
        return 1;
      }

      return Math.round(refs.seriesTrack.scrollLeft / getWidth());
    }

    function goRelative(delta) {
      if (!refs.seriesTrack) {
        return;
      }

      const nextPanel = getCurrentPanel() + delta;
      if (nextPanel <= 0) {
        window.location.href = refs.seriesShell?.dataset.returnUrl || "../index.html";
        return;
      }

      seriesShell.scrollToPanel(nextPanel);
    }

    function handleWheel(event) {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.15;
      if (!horizontal) {
        return;
      }

      event.preventDefault();
      if (Math.abs(event.deltaX) < 18 || wheelLockTimer) {
        return;
      }

      goRelative(event.deltaX > 0 ? 1 : -1);
      wheelLockTimer = window.setTimeout(() => {
        wheelLockTimer = 0;
      }, 420);
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

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) < 58 || Math.abs(deltaX) < Math.abs(deltaY) * 1.18) {
        return;
      }

      goRelative(deltaX < 0 ? 1 : -1);
    }

    function handleFrameClick(event) {
      const target = event.target;
      const element = target?.nodeType === 1 ? target : target?.parentElement;
      const link = element?.closest?.("a[href]");
      const button = element?.closest?.("button");
      if (!link && !button) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    }

    function handleFrameSubmit(event) {
      event.preventDefault();
      event.stopPropagation();
    }

    function disableFrameNavigation(frameDocument) {
      frameDocument.querySelectorAll("a[href]").forEach((link) => {
        if (!link.dataset.watchOriginalHref) {
          link.dataset.watchOriginalHref = link.getAttribute("href") || "";
        }

        link.removeAttribute("href");
        link.setAttribute("role", "button");
      });

      frameDocument.querySelectorAll("button:not([type])").forEach((button) => {
        button.type = "button";
      });
    }

    function installFrameBridge(frame) {
      try {
        const frameWindow = frame.contentWindow;
        const frameDocument = frame.contentDocument;
        if (!frameWindow || !frameDocument || frameDocument.__watchSeriesBridgeInstalled) {
          return;
        }

        frameDocument.__watchSeriesBridgeInstalled = true;
        disableFrameNavigation(frameDocument);

        const observer = new MutationObserver(() => {
          disableFrameNavigation(frameDocument);
        });
        observer.observe(frameDocument.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["href"],
        });

        frameWindow.addEventListener("wheel", handleWheel, { passive: false, capture: true });
        frameWindow.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
        frameWindow.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });
        frameDocument.addEventListener("wheel", handleWheel, { passive: false, capture: true });
        frameDocument.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
        frameDocument.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });
        frameDocument.addEventListener("click", handleFrameClick, { capture: true });
        frameDocument.addEventListener("submit", handleFrameSubmit, { capture: true });
      } catch (error) {
        // Watch pages are bundled same-origin files. Ignore future external frames.
      }
    }

    function primeWatchTrackPosition() {
      if (!refs.seriesTrack) {
        return;
      }

      const previousScrollBehavior = refs.seriesTrack.style.scrollBehavior;
      refs.seriesTrack.style.scrollBehavior = "auto";
      seriesShell.primeTrackPosition();
      refs.seriesTrack.scrollLeft = getWidth();

      window.requestAnimationFrame(() => {
        refs.seriesTrack.style.scrollBehavior = previousScrollBehavior;
      });
    }

    primeWatchTrackPosition();

    frames.forEach((frame) => {
      frame.addEventListener("load", () => installFrameBridge(frame));
      installFrameBridge(frame);
    });

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });
    window.addEventListener("resize", () => {
      seriesShell.handleResize();
    });

    document.addEventListener("keydown", (event) => {
      seriesShell.handleKeydown(event);
    });

  });
})();
