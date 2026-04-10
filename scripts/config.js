(function () {
  window.HelloAgain = window.HelloAgain || {};

  window.HelloAgain.config = {
    sceneIds: {
      first: "bI8aNzR73fufLl3VQzxS",
      second: "FOGGaWWBJTROrgs0VrUj",
      mac: "Q6TM0L94yWawb1z4JKRT",
    },
    externalUrls: {
      classicMac: "https://infinitemac.org/1990/System%206.0.7",
    },
    panels: {
      sentinel: 0,
      mac: 1,
      aqua: 2,
      three: 3,
      sequence: 4,
    },
    panelLast: 5,
    trackSettleMs: 110,
    helloHintDelayMs: 1500,
    helloPageProgressThreshold: 0.96,
    macSceneDimensions: {
      width: 1440,
      height: 900,
    },
    unicornSceneOptions: {
      scale: 1,
      dpi: 1.5,
      fps: 60,
      lazyLoad: false,
      production: true,
    },
    imageSequence: {
      frameCount: 151,
      frameWidth: 1280,
      frameHeight: 720,
      path(frameIndex) {
        const index = String(frameIndex + 1).padStart(3, "0");
        return `./assets/frames/ezgif-frame-${index}.png`;
      },
    },
  };
})();
