(function () {
  window.HelloAgain = window.HelloAgain || {};

  const { clamp } = window.HelloAgain.utils;

  window.HelloAgain.updateScrollTransition = function updateScrollTransition(refs) {
    if (window.HelloAgain.motion && window.HelloAgain.motion.usesGsapHomeTransition) {
      return;
    }

    if (!refs.sceneStage) {
      return;
    }

    const viewportHeight = Math.max(window.innerHeight, 1);
    const progress = clamp(window.scrollY / (viewportHeight * 1.8), 0, 1);
    const firstScale = 1 - progress * 0.045;
    const firstBlur = progress * 14;
    const firstOpacity = 1 - progress * 0.985;

    refs.sceneStage.style.opacity = String(firstOpacity);
    refs.sceneStage.style.transform = `scale(${firstScale})`;
    refs.sceneStage.style.filter = `blur(${firstBlur}px) saturate(${1 - progress * 0.22})`;
  };
})();
