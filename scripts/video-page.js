(function () {
  const fadeOutPauseThreshold = 0.015;

  function boot() {
    const scroller = document.querySelector("[data-video-scroll]");
    const stage = scroller?.querySelector(".series-video-page__stage");
    const video = scroller?.querySelector(".series-video-page__video");
    if (!scroller || !stage || !video) {
      return;
    }

    const fadeRange = () => Math.max(window.innerHeight * 0.55, 320);

    function resumeVideo() {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          video.muted = true;
          const fallbackPlay = video.play();
          if (fallbackPlay && typeof fallbackPlay.catch === "function") {
            fallbackPlay.catch(() => {});
          }
        });
      }
    }

    function updateFade() {
      const progress = Math.max(Math.min(scroller.scrollTop / fadeRange(), 1), 0);
      const opacity = 1 - progress;
      stage.style.setProperty("--series-video-opacity", String(opacity));
      stage.style.setProperty("--series-stage-opacity", String(opacity));

      if (opacity <= fadeOutPauseThreshold) {
        if (!video.paused) {
          video.pause();
        }
        return;
      }

      if (document.visibilityState === "visible" && video.dataset.shouldPlay === "true" && video.paused) {
        resumeVideo();
      }
    }

    function startVideo() {
      try {
        video.currentTime = 0;
      } catch (_) {}

      video.dataset.shouldPlay = "true";
      video.volume = 0.18;
      video.muted = false;

      const attemptPlay = () => {
        if (video.dataset.shouldPlay !== "true") {
          return;
        }
        resumeVideo();
      };

      if (video.readyState < 2) {
        video.load();
        video.addEventListener("canplay", attemptPlay, { once: true });
      }

      window.requestAnimationFrame(attemptPlay);
      window.setTimeout(attemptPlay, 120);
      window.setTimeout(attemptPlay, 360);
      window.setTimeout(attemptPlay, 800);
    }

    scroller.addEventListener("scroll", updateFade, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        video.pause();
        return;
      }
      updateFade();
    });
    window.addEventListener("resize", updateFade);

    updateFade();
    startVideo();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
