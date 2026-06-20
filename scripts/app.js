(function () {
  window.HelloAgain = window.HelloAgain || {};

  window.HelloAgain.initApp = function initApp() {
    const refs = window.HelloAgain.createRefs();
    const motion = window.HelloAgain.createMotionController
      ? window.HelloAgain.createMotionController(refs)
      : null;
    const scenes = window.HelloAgain.createSceneController(refs);
    const scrollHint = window.HelloAgain.createScrollHintController(refs);

    function bindEvents() {
      window.addEventListener(
        "scroll",
        () => {
          window.HelloAgain.updateScrollTransition(refs);
          if (window.scrollY > 8) {
            scrollHint.markHelloScrollInteraction();
          }
        },
        { passive: true }
      );

      window.addEventListener(
        "wheel",
        (event) => {
          if (window.scrollY <= 8 && event.deltaY > 2) {
            scrollHint.markHelloScrollInteraction();
          }
        },
        { passive: true }
      );

      window.addEventListener(
        "touchmove",
        () => {
          if (window.scrollY <= 8) {
            scrollHint.markHelloScrollInteraction();
          }
        },
        { passive: true }
      );

      window.addEventListener("resize", () => {
        window.HelloAgain.updateScrollTransition(refs);
        motion?.handleResize();
      });
    }

    window.HelloAgain.updateScrollTransition(refs);
    bindEvents();
    scrollHint.scheduleHelloHint();
    motion?.init();
    scenes.ensureSecondScene();

    if (window.UnicornStudio && typeof window.UnicornStudio.init === "function") {
      window.UnicornStudio.init();
    }

    scenes.ensureFirstScene();
  };
})();
