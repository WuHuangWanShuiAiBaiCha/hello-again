(function () {
  window.HelloAgain = window.HelloAgain || {};

  window.HelloAgain.createSeriesSwipeController = function createSeriesSwipeController(options) {
    const refs = options.refs;
    const seriesShell = options.seriesShell;
    const frameSelector = options.frameSelector || "";
    const bridgeName = options.bridgeName || "__seriesSwipeBridgeInstalled";
    const originalHrefName = options.originalHrefName || "seriesOriginalHref";
    const defaultLastPanel = options.defaultLastPanel || window.HelloAgain.config.panelLast || 1;
    const startPanel = options.startPanel || 1;
    const preventFrameNavigation = options.preventFrameNavigation !== false;
    const useSentinelExit = options.useSentinelExit !== false;
    const onPanelChange = options.onPanelChange || null;
    const onBeforePanelChange = options.onBeforePanelChange || null;
    const onAfterPanelChange = options.onAfterPanelChange || null;
    const dragFollowsTouch = options.dragFollowsTouch === true;

    const getWidth = () => window.HelloAgain.utils.viewportWidth();
    const getLastPanel = () => {
      const rawValue = Number(refs.seriesShell?.dataset.panelLast);
      return Number.isFinite(rawValue) ? Math.max(1, Math.round(rawValue)) : defaultLastPanel;
    };

    let activePanel = startPanel;
    let wheelLockTimer = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScrollLeft = 0;
    let touchStartPanel = startPanel;
    let previousTrackScrollBehavior = "";
    let previousTrackScrollSnapType = "";
    let touchMode = "";

    function getCurrentPanel() {
      if (!refs.seriesTrack) {
        return startPanel;
      }

      return window.HelloAgain.utils.clamp(
        Math.round(refs.seriesTrack.scrollLeft / getWidth()),
        useSentinelExit ? 0 : 1,
        getLastPanel()
      );
    }

    function syncActivePanelFromTrack() {
      const nextPanel = getCurrentPanel();
      if (nextPanel !== activePanel) {
        activePanel = nextPanel;
        onPanelChange?.(activePanel);
      }
      return activePanel;
    }

    function exitToReturnUrl() {
      window.location.href = refs.seriesShell?.dataset.returnUrl || "../index.html";
    }

    function goToPanel(panelIndex, behavior) {
      if (!refs.seriesTrack) {
        return;
      }

      const targetPanel = window.HelloAgain.utils.clamp(
        Math.round(panelIndex),
        useSentinelExit ? 0 : 1,
        getLastPanel()
      );

      if (targetPanel <= 0 && useSentinelExit) {
        exitToReturnUrl();
        return;
      }

      onBeforePanelChange?.(targetPanel, activePanel);
      activePanel = targetPanel;
      seriesShell.scrollToPanel(activePanel, behavior);
      onPanelChange?.(activePanel);
      onAfterPanelChange?.(activePanel);
    }

    function goRelative(delta) {
      syncActivePanelFromTrack();
      goToPanel(activePanel + delta);
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
      const touch = event.touches?.[0];
      if (!touch) {
        return;
      }

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartScrollLeft = refs.seriesTrack?.scrollLeft || 0;
      touchStartPanel = getCurrentPanel();
      previousTrackScrollBehavior = refs.seriesTrack?.style.scrollBehavior || "";
      previousTrackScrollSnapType = refs.seriesTrack?.style.scrollSnapType || "";
      touchMode = "";
    }

    function handleTouchMove(event) {
      const touch = event.touches?.[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (!touchMode && (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
        touchMode = Math.abs(deltaX) > Math.abs(deltaY) * 1.15 ? "x" : "y";
      }

      if (touchMode === "x") {
        event.preventDefault();
        if (dragFollowsTouch && refs.seriesTrack) {
          refs.seriesTrack.style.scrollBehavior = "auto";
          refs.seriesTrack.style.scrollSnapType = "none";
          refs.seriesTrack.scrollLeft = touchStartScrollLeft - deltaX;
        }
      }
    }

    function handleTouchEnd(event) {
      const touch = event.changedTouches?.[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (dragFollowsTouch && refs.seriesTrack) {
        refs.seriesTrack.style.scrollBehavior = previousTrackScrollBehavior;
        refs.seriesTrack.style.scrollSnapType = previousTrackScrollSnapType;
      }

      if (touchMode !== "x") {
        return;
      }

      if (Math.abs(deltaX) < 58 || Math.abs(deltaX) < Math.abs(deltaY) * 1.18) {
        if (dragFollowsTouch) {
          goToPanel(touchStartPanel);
        }
        return;
      }

      if (dragFollowsTouch) {
        goToPanel(touchStartPanel + (deltaX < 0 ? 1 : -1));
        return;
      }

      goRelative(deltaX < 0 ? 1 : -1);
    }

    function handleFrameClick(event) {
      if (!preventFrameNavigation) {
        return;
      }

      const target = event.target;
      const element = target?.nodeType === 1 ? target : target?.parentElement;
      const link = element?.closest?.("a[href], area[href]");
      const button = element?.closest?.("button");
      if (!link && !button) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    }

    function handleFrameSubmit(event) {
      if (!preventFrameNavigation) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    }

    function disableFrameNavigation(frameDocument) {
      if (!preventFrameNavigation) {
        return;
      }

      frameDocument.querySelectorAll("a[href], area[href]").forEach((link) => {
        if (!link.dataset[originalHrefName]) {
          link.dataset[originalHrefName] = link.getAttribute("href") || "";
        }

        link.removeAttribute("href");
        link.setAttribute("role", "button");
      });

      frameDocument.querySelectorAll("form").forEach((form) => {
        form.setAttribute("action", "#");
      });

      frameDocument.querySelectorAll("button:not([type])").forEach((button) => {
        button.type = "button";
      });
    }

    function installFrameBridge(frame) {
      try {
        const frameWindow = frame.contentWindow;
        const frameDocument = frame.contentDocument;
        if (!frameWindow || !frameDocument || frameDocument[bridgeName]) {
          return;
        }

        frameDocument[bridgeName] = true;
        disableFrameNavigation(frameDocument);

        const observer = new MutationObserver(() => {
          disableFrameNavigation(frameDocument);
        });
        observer.observe(frameDocument.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["href", "action"],
        });

        frameWindow.addEventListener("wheel", handleWheel, { passive: false, capture: true });
        frameWindow.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
        frameWindow.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
        frameWindow.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });
        frameDocument.addEventListener("wheel", handleWheel, { passive: false, capture: true });
        frameDocument.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
        frameDocument.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
        frameDocument.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });
        frameDocument.addEventListener("click", handleFrameClick, { capture: true });
        frameDocument.addEventListener("submit", handleFrameSubmit, { capture: true });
      } catch (error) {
        // Device pages are bundled same-origin files. Ignore future external frames.
      }
    }

    function installFrameBridges() {
      if (!frameSelector) {
        return;
      }

      Array.from(document.querySelectorAll(frameSelector)).forEach((frame) => {
        frame.addEventListener("load", () => installFrameBridge(frame));
        installFrameBridge(frame);
      });
    }

    function primeTrackPosition(panelIndex) {
      if (!refs.seriesTrack) {
        return;
      }

      const targetPanel = panelIndex || startPanel;
      const previousScrollBehavior = refs.seriesTrack.style.scrollBehavior;
      refs.seriesTrack.style.scrollBehavior = "auto";
      seriesShell.primeTrackPosition();
      refs.seriesTrack.scrollLeft = getWidth() * targetPanel;
      activePanel = targetPanel;
      onPanelChange?.(activePanel);

      window.requestAnimationFrame(() => {
        refs.seriesTrack.style.scrollBehavior = previousScrollBehavior;
      });
    }

    function bind() {
      installFrameBridges();

      refs.seriesTrack?.addEventListener(
        "scroll",
        () => {
          window.requestAnimationFrame(syncActivePanelFromTrack);
        },
        { passive: true }
      );

      window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
      window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
      window.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });
    }

    return {
      bind,
      getCurrentPanel,
      goRelative,
      goToPanel,
      installFrameBridges,
      primeTrackPosition,
      syncActivePanelFromTrack,
    };
  };
})();
