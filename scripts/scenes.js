(function () {
  window.HelloAgain = window.HelloAgain || {};

  const { config } = window.HelloAgain;

  window.HelloAgain.createSceneController = function createSceneController(refs) {
    let firstScenePromise = null;
    let secondScenePromise = null;
    let macScenePromise = null;

    async function ensureFirstScene() {
      if (
        firstScenePromise ||
        !window.UnicornStudio ||
        typeof window.UnicornStudio.addScene !== "function"
      ) {
        return firstScenePromise;
      }

      firstScenePromise = window.UnicornStudio
        .addScene({
          elementId: "unicorn-container",
          projectId: config.sceneIds.first,
          ...config.unicornSceneOptions,
        })
        .catch((error) => {
          console.error("Failed to initialize first scene", error);
          return null;
        });

      return firstScenePromise;
    }

    async function ensureMacScene() {
      if (macScenePromise) {
        return macScenePromise;
      }

      macScenePromise = Promise.resolve()
        .then(() => {
          if (
            !refs.macStage ||
            !window.UnicornStudio ||
            typeof window.UnicornStudio.addScene !== "function"
          ) {
            return null;
          }

          return window.UnicornStudio.addScene({
            elementId: "mac-detail-scene",
            projectId: config.sceneIds.mac,
            ...config.unicornSceneOptions,
          });
        })
        .catch((error) => {
          console.error("Failed to initialize Mac scene", error);
          return null;
        });

      return macScenePromise;
    }

    function ensureSecondScene() {
      if (secondScenePromise) {
        return secondScenePromise;
      }

      if (
        !refs.nextSceneEmbed ||
        !window.UnicornStudio ||
        typeof window.UnicornStudio.addScene !== "function"
      ) {
        return null;
      }

      secondScenePromise = window.UnicornStudio
        .addScene({
          elementId: "next-scene-embed",
          projectId: config.sceneIds.second,
          ...config.unicornSceneOptions,
        })
        .catch((error) => {
          console.error("Failed to initialize second scene", error);
          return null;
        });

      return secondScenePromise;
    }

    function updateMacSceneScale() {
      if (!refs.macStage) {
        return;
      }

      const widthScale = window.innerWidth / config.macSceneDimensions.width;
      const heightScale = window.innerHeight / config.macSceneDimensions.height;
      refs.macStage.style.setProperty("--mac-scene-scale", Math.max(widthScale, heightScale).toFixed(4));
    }

    return {
      ensureFirstScene,
      ensureSecondScene,
      ensureMacScene,
      updateMacSceneScale,
    };
  };
})();
