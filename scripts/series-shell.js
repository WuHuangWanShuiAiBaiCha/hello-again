(function () {
  window.HelloAgain = window.HelloAgain || {};

  const { config, utils } = window.HelloAgain;

  window.HelloAgain.createSeriesShellController = function createSeriesShellController(refs) {
    let activePanel = config.panels.sentinel;
    let trackSettleTimer = 0;
    let motionController = null;

    function setMotionController(controller) {
      motionController = controller;
    }

    function clearTrackSettleTimer() {
      if (!trackSettleTimer) {
        return;
      }

      window.clearTimeout(trackSettleTimer);
      trackSettleTimer = 0;
    }

    function getPanelLeft(panelIndex) {
      return utils.viewportWidth() * panelIndex;
    }

    function setShellOpen(isOpen) {
      if (!refs.seriesShell) {
        return;
      }

      refs.seriesShell.classList.toggle("is-open", isOpen);
      refs.seriesShell.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }

    function syncActivePanelFromTrack() {
      if (!refs.seriesTrack) {
        return;
      }

      const panelIndex = Math.round(refs.seriesTrack.scrollLeft / utils.viewportWidth());
      activePanel = utils.clamp(panelIndex, config.panels.sentinel, config.panelLast);
    }

    function scrollToPanel(panelIndex, behavior) {
      if (!refs.seriesTrack) {
        return;
      }

      activePanel = panelIndex;

      if (behavior === "auto") {
        refs.seriesTrack.scrollLeft = getPanelLeft(panelIndex);
        motionController?.updateSeriesTrackEffects();
        return;
      }

      if (motionController?.tweenSeriesTo) {
        motionController.tweenSeriesTo(panelIndex);
        return;
      }

      refs.seriesTrack.scrollTo({
        left: getPanelLeft(panelIndex),
        top: 0,
        behavior: behavior || "smooth",
      });
    }

    function closeSeriesShell() {
      clearTrackSettleTimer();
      setShellOpen(false);
      activePanel = config.panels.sentinel;

      requestAnimationFrame(() => {
        if (!refs.seriesTrack) {
          return;
        }

        refs.seriesTrack.scrollLeft = getPanelLeft(config.panels.mac);
        motionController?.updateSeriesTrackEffects();
      });
    }

    function openSeriesAtMac() {
      refs.seriesPages.forEach((page) => {
        page.scrollTop = 0;
      });
      setShellOpen(true);
      scrollToPanel(config.panels.mac, "auto");
    }

    function settleTrackPosition() {
      if (!refs.seriesTrack) {
        return;
      }

      syncActivePanelFromTrack();

      if (activePanel === config.panels.sentinel) {
        closeSeriesShell();
      }
    }

    function scheduleTrackSettle() {
      clearTrackSettleTimer();
      trackSettleTimer = window.setTimeout(() => {
        trackSettleTimer = 0;
        settleTrackPosition();
      }, config.trackSettleMs);
    }

    function handleResize() {
      if (!refs.seriesShell || !refs.seriesShell.classList.contains("is-open")) {
        return;
      }

      scrollToPanel(activePanel === config.panels.sentinel ? config.panels.mac : activePanel, "auto");
    }

    function handleKeydown(event) {
      if (!refs.seriesShell || !refs.seriesShell.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape" || event.key === "ArrowLeft") {
        if (activePanel > config.panels.mac) {
          scrollToPanel(activePanel - 1);
        } else {
          closeSeriesShell();
        }
      } else if (
        event.key === "ArrowRight" &&
        activePanel >= config.panels.mac &&
        activePanel < config.panelLast
      ) {
        scrollToPanel(activePanel + 1);
      }
    }

    function primeTrackPosition() {
      if (!refs.seriesTrack) {
        return;
      }

      refs.seriesTrack.scrollLeft = getPanelLeft(config.panels.mac);
    }

    return {
      openSeriesAtMac,
      setMotionController,
      scheduleTrackSettle,
      handleResize,
      handleKeydown,
      primeTrackPosition,
      isOpen() {
        return !!(refs.seriesShell && refs.seriesShell.classList.contains("is-open"));
      },
    };
  };
})();
