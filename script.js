(function () {
  const FIRST_SCENE_PROJECT = "bI8aNzR73fufLl3VQzxS";
  const MAC_SCENE_PROJECT = "Q6TM0L94yWawb1z4JKRT";
  const CLASSIC_MAC_URL = "https://infinitemac.org/1990/System%206.0.7";

  const PANEL_SENTINEL = 0;
  const PANEL_MAC = 1;
  const PANEL_AQUA = 2;
  const PANEL_THREE = 3;
  const PANEL_FOUR = 4;
  const PANEL_FIVE = 5;
  const PANEL_LAST = PANEL_FIVE;
  const TRACK_SETTLE_MS = 110;
  const HELLO_HINT_DELAY_MS = 1500;

  const refs = {
    sceneStage: document.querySelector(".scene-stage"),
    nextScene: document.querySelector(".next-scene"),
    transitionNextScene: document.getElementById("transition-next-scene"),
    helloScrollHint: document.getElementById("hello-scroll-hint"),
    macButton: document.getElementById("mac-button"),
    seriesShell: document.getElementById("series-shell"),
    seriesTrack: document.getElementById("series-track"),
    macPage: document.getElementById("mac-page"),
    macStage: document.getElementById("mac-stage"),
    aquaPage: document.getElementById("aqua-page"),
    seriesPages: Array.from(document.querySelectorAll("[data-series-scroll]")),
    macSceneHitarea: document.getElementById("mac-scene-hitarea"),
  };

  let firstScenePromise = null;
  let macScenePromise = null;
  let ignoreMacClickUntil = 0;
  let activePanel = PANEL_SENTINEL;
  let trackSettleTimer = 0;
  let helloHintTimer = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function viewportWidth() {
    return Math.max(window.innerWidth, 1);
  }

  function clearTrackSettleTimer() {
    if (!trackSettleTimer) {
      return;
    }

    window.clearTimeout(trackSettleTimer);
    trackSettleTimer = 0;
  }

  function getHelloProgress() {
    return window.scrollY / Math.max(window.innerHeight, 1);
  }

  function isPastHelloPage() {
    return getHelloProgress() >= 0.96;
  }

  function clearHelloHintTimer() {
    if (!helloHintTimer) {
      return;
    }

    window.clearTimeout(helloHintTimer);
    helloHintTimer = 0;
  }

  function showHelloHint() {
    if (!refs.helloScrollHint || isPastHelloPage()) {
      return;
    }

    refs.helloScrollHint.classList.add("is-visible");
  }

  function hideHelloHint() {
    if (!refs.helloScrollHint) {
      return;
    }

    refs.helloScrollHint.classList.remove("is-visible");
  }

  function markHelloScrollInteraction() {
    clearHelloHintTimer();
    hideHelloHint();

    if (isPastHelloPage()) {
      return;
    }

    scheduleHelloHint();
  }

  function scheduleHelloHint() {
    if (!refs.helloScrollHint || isPastHelloPage()) {
      return;
    }

    clearHelloHintTimer();
    helloHintTimer = window.setTimeout(() => {
      helloHintTimer = 0;
      showHelloHint();
    }, HELLO_HINT_DELAY_MS);
  }

  function updateScrollTransition() {
    if (!refs.sceneStage || !refs.nextScene || !refs.transitionNextScene) {
      return;
    }

    const viewportHeight = Math.max(window.innerHeight, 1);
    const progress = clamp(window.scrollY / (viewportHeight * 1.8), 0, 1);
    const firstScale = 1 - progress * 0.045;
    const firstBlur = progress * 14;
    const firstOpacity = 1 - progress * 0.985;
    const nextOpacity = Math.pow(progress, 1.35);
    const nextTranslate = (1 - progress) * 92;
    const nextScale = 1.06 - progress * 0.06;
    const nextBlur = (1 - progress) * 16;

    refs.sceneStage.style.opacity = String(firstOpacity);
    refs.sceneStage.style.transform = `scale(${firstScale})`;
    refs.sceneStage.style.filter = `blur(${firstBlur}px) saturate(${1 - progress * 0.22})`;

    refs.transitionNextScene.style.opacity = String(nextOpacity);
    refs.transitionNextScene.style.transform = `translateY(${nextTranslate}px) scale(${nextScale})`;
    refs.transitionNextScene.style.filter = `blur(${nextBlur}px) saturate(${0.76 + progress * 0.24})`;
  }

  function updateMacSceneScale() {
    if (!refs.macStage) {
      return;
    }

    const widthScale = window.innerWidth / 1440;
    const heightScale = window.innerHeight / 900;
    refs.macStage.style.setProperty("--mac-scene-scale", Math.max(widthScale, heightScale).toFixed(4));
  }

  function getPanelLeft(panelIndex) {
    return viewportWidth() * panelIndex;
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

    const panelIndex = Math.round(refs.seriesTrack.scrollLeft / viewportWidth());
    activePanel = clamp(panelIndex, PANEL_SENTINEL, PANEL_LAST);
  }

  function closeSeriesShell() {
    clearTrackSettleTimer();
    setShellOpen(false);
    activePanel = PANEL_SENTINEL;

    requestAnimationFrame(() => {
      if (!refs.seriesTrack) {
        return;
      }

      refs.seriesTrack.scrollLeft = getPanelLeft(PANEL_MAC);
    });
  }

  function scrollToPanel(panelIndex, behavior = "smooth") {
    if (!refs.seriesTrack) {
      return;
    }

    activePanel = panelIndex;
    refs.seriesTrack.scrollTo({
      left: getPanelLeft(panelIndex),
      top: 0,
      behavior,
    });
  }

  function openSeriesAtMac() {
    refs.seriesPages.forEach((page) => {
      page.scrollTop = 0;
    });
    setShellOpen(true);
    scrollToPanel(PANEL_MAC, "auto");
  }

  function settleTrackPosition() {
    if (!refs.seriesTrack) {
      return;
    }

    syncActivePanelFromTrack();

    if (activePanel === PANEL_SENTINEL) {
      closeSeriesShell();
      return;
    }

    if (activePanel === PANEL_MAC) {
      refs.macPage.scrollTop = refs.macPage.scrollTop || 0;
      return;
    }

    const currentScroller = refs.seriesPages[activePanel - 1];
    if (currentScroller) {
      currentScroller.scrollTop = currentScroller.scrollTop || 0;
    }
  }

  function scheduleTrackSettle() {
    clearTrackSettleTimer();
    trackSettleTimer = window.setTimeout(() => {
      trackSettleTimer = 0;
      settleTrackPosition();
    }, TRACK_SETTLE_MS);
  }

  async function ensureFirstScene() {
    if (
      firstScenePromise ||
      !window.UnicornStudio ||
      typeof window.UnicornStudio.addScene !== "function"
    ) {
      return firstScenePromise;
    }

    firstScenePromise = window.UnicornStudio.addScene({
      elementId: "unicorn-container",
      projectId: FIRST_SCENE_PROJECT,
      scale: 1,
      dpi: 1.5,
      fps: 60,
      lazyLoad: false,
      production: true,
    }).catch((error) => {
      console.error("Failed to initialize first scene", error);
      return null;
    });

    return firstScenePromise;
  }

  async function ensureMacScene() {
    if (
      macScenePromise ||
      !window.UnicornStudio ||
      typeof window.UnicornStudio.addScene !== "function"
    ) {
      return macScenePromise;
    }

    macScenePromise = window.UnicornStudio.addScene({
      elementId: "mac-detail-scene",
      projectId: MAC_SCENE_PROJECT,
      scale: 1,
      dpi: 1.5,
      fps: 60,
      lazyLoad: false,
      production: true,
    }).catch((error) => {
      console.error("Failed to initialize Mac scene", error);
      return null;
    });

    return macScenePromise;
  }

  function bindEvents() {
    refs.macButton?.addEventListener("click", async () => {
      openSeriesAtMac();
      updateMacSceneScale();
      await ensureMacScene();
    });

    refs.macSceneHitarea?.addEventListener("click", (event) => {
      if (performance.now() < ignoreMacClickUntil) {
        event.preventDefault();
        return;
      }

      window.open(`${CLASSIC_MAC_URL}?t=${Date.now()}`, "_blank", "noopener");
    });

    refs.seriesTrack?.addEventListener(
      "scroll",
      () => {
        if (!refs.seriesShell?.classList.contains("is-open")) {
          return;
        }

        scheduleTrackSettle();
      },
      { passive: true }
    );

    window.addEventListener(
      "scroll",
      () => {
        updateScrollTransition();
        if (window.scrollY > 8) {
          markHelloScrollInteraction();
        }
      },
      { passive: true }
    );
    window.addEventListener(
      "wheel",
      (event) => {
        if (window.scrollY <= 8 && event.deltaY > 2) {
          markHelloScrollInteraction();
        }
      },
      { passive: true }
    );
    window.addEventListener(
      "touchmove",
      () => {
        if (window.scrollY <= 8) {
          markHelloScrollInteraction();
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", () => {
      updateScrollTransition();
      updateMacSceneScale();

      if (!refs.seriesShell?.classList.contains("is-open")) {
        return;
      }

      scrollToPanel(activePanel === PANEL_SENTINEL ? PANEL_MAC : activePanel, "auto");
    });

    window.addEventListener("keydown", (event) => {
      if (!refs.seriesShell?.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape" || event.key === "ArrowLeft") {
        if (activePanel > PANEL_MAC) {
          scrollToPanel(activePanel - 1);
        } else {
          closeSeriesShell();
        }
      } else if (event.key === "ArrowRight" && activePanel >= PANEL_MAC && activePanel < PANEL_LAST) {
        scrollToPanel(activePanel + 1);
      }
    });
  }

  function init() {
    updateScrollTransition();
    updateMacSceneScale();
    bindEvents();
    scheduleHelloHint();

    if (window.UnicornStudio && typeof window.UnicornStudio.init === "function") {
      window.UnicornStudio.init();
    }

    if (refs.seriesTrack) {
      refs.seriesTrack.scrollLeft = getPanelLeft(PANEL_MAC);
    }

    ensureFirstScene();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
