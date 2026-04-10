(function () {
  window.HelloAgain = window.HelloAgain || {};

  window.HelloAgain.createRefs = function createRefs() {
    return {
      scrollTransition: document.getElementById("scroll-transition"),
      sceneStage: document.querySelector(".scene-stage"),
      nextPage: document.querySelector(".next-page"),
      nextScene: document.querySelector(".next-scene"),
      nextSceneEmbed: document.getElementById("next-scene-embed"),
      helloScrollHint: document.getElementById("hello-scroll-hint"),
      macButton: document.getElementById("mac-button"),
      seriesShell: document.getElementById("series-shell"),
      seriesTrack: document.getElementById("series-track"),
      seriesPanels: Array.from(document.querySelectorAll(".series-panel")),
      macStage: document.getElementById("mac-stage"),
      seriesPages: Array.from(document.querySelectorAll("[data-series-scroll]")),
      aquaPage: document.getElementById("aqua-page"),
      seriesPageThree: document.getElementById("series-page-three"),
      sequenceScroller: document.getElementById("series-page-four"),
      sequenceIntro: document.getElementById("sequence-intro"),
      sequenceIntroVideo: document.getElementById("sequence-intro-video"),
      sequenceIntroPlay: document.getElementById("sequence-intro-play"),
      sequenceSection: document.getElementById("product-sequence"),
      sequenceStage: document.getElementById("product-sequence-stage"),
      sequenceCanvas: document.getElementById("product-sequence-canvas"),
      sequenceVideo: document.getElementById("product-sequence-video"),
      sequenceTrigger: document.getElementById("product-sequence-trigger"),
      sequenceTail: document.querySelector(".product-sequence__tail"),
      macSceneHitarea: document.getElementById("mac-scene-hitarea"),
      seriesPageTwoVideo: document.getElementById("series-page-two-video"),
      seriesPageThreeVideo: document.getElementById("series-page-three-video"),
    };
  };
})();
