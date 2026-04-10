(function () {
  window.HelloAgain = window.HelloAgain || {};

  window.HelloAgain.utils = {
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    },
    viewportWidth() {
      return Math.max(window.innerWidth, 1);
    },
  };
})();
