(function () {
  function boot() {
    const refs = {
      macStage: document.getElementById("mac-stage"),
      macSceneHitarea: document.getElementById("mac-scene-hitarea"),
    };
    const scenes = window.HelloAgain.createSceneController(refs);

    refs.macSceneHitarea?.addEventListener("click", () => {
      window.open(
        `${window.HelloAgain.config.externalUrls.classicMac}?t=${Date.now()}`,
        "_blank",
        "noopener"
      );
    });

    window.addEventListener("resize", () => {
      scenes.updateMacSceneScale();
    });

    scenes.updateMacSceneScale();

    if (window.UnicornStudio && typeof window.UnicornStudio.init === "function") {
      window.UnicornStudio.init();
    }

    scenes.ensureMacScene();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
