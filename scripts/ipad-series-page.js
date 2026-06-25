(function () {
  window.HelloAgain = window.HelloAgain || {};

  document.addEventListener("DOMContentLoaded", () => {
    const refs = window.HelloAgain.createRefs();
    const seriesShell = window.HelloAgain.createSeriesShellController(refs);
    const swipe = window.HelloAgain.createSeriesSwipeController({
      refs,
      seriesShell,
      frameSelector: ".ipad-frame",
      bridgeName: "__ipadSeriesBridgeInstalled",
      originalHrefName: "ipadOriginalHref",
      defaultLastPanel: 4,
      startPanel: 1,
    });

    swipe.primeTrackPosition(1);
    swipe.bind();

    window.addEventListener("resize", () => {
      seriesShell.handleResize();
    });

    document.addEventListener("keydown", (event) => {
      seriesShell.handleKeydown(event);
    });
  });
})();
