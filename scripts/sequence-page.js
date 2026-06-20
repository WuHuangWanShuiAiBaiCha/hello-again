(function () {
  function boot() {
    const refs = window.HelloAgain.createRefs();
    const imageSequence = window.HelloAgain.createImageSequenceController(refs);

    imageSequence.init();
    imageSequence.ensureReady();
    imageSequence.handlePanelEnter();

    window.addEventListener("resize", () => {
      imageSequence.handleResize();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        imageSequence.handlePanelExit();
        return;
      }
      imageSequence.handlePanelEnter();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
