(function () {
  window.HelloAgain = window.HelloAgain || {};

  const { config, utils } = window.HelloAgain;
  const { clamp } = utils;

  window.HelloAgain.createImageSequenceController = function createImageSequenceController(refs) {
    if (!refs.sequenceScroller || !refs.sequenceSection || !refs.sequenceStage || !refs.sequenceCanvas) {
      return {
        init() {},
        ensureReady() {},
        handleResize() {},
        reset() {},
      };
    }

    const canvas = refs.sequenceCanvas;
    const context = canvas.getContext("2d", { alpha: true });
    const frames = new Array(config.imageSequence.frameCount);
    const backgroundColor = "rgb(242, 241, 246)";
    const videoHoldTimeSeconds = 5.9;
    let isInitialized = false;
    let frameIndex = config.imageSequence.frameCount - 1;
    let rafId = 0;
    let isRenderQueued = false;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let sequenceState = "frames";
    let lockedScrollTop = 0;
    let videoHasUnlocked = false;
    let videoEndedHandlerBound = false;
    let triggerBound = false;
    let introPlayedOnce = false;
    let introDestroyed = false;
    let introExitTimer = 0;
    let introDestroyTimer = 0;
    let scrollLockBound = false;
    let introPlayBound = false;
    let refreshPullDistance = 0;
    let refreshTriggered = false;
    let touchPullStartY = null;

    const refreshThreshold = 120;

    function getSticky() {
      return refs.sequenceSection.querySelector(".product-sequence__sticky");
    }

    function getSequenceRange() {
      return Math.max(refs.sequenceStage.offsetHeight - refs.sequenceScroller.clientHeight, 1);
    }

    function getLocalScrollTop() {
      return Math.max(refs.sequenceScroller.scrollTop - refs.sequenceSection.offsetTop, 0);
    }

    function getProgress() {
      return clamp(getLocalScrollTop() / getSequenceRange(), 0, 1);
    }

    function applyBackgroundColor() {
      const sequencePanel = refs.sequenceScroller.closest(".series-panel");
      const sticky = getSticky();

      refs.sequenceScroller.style.background = backgroundColor;
      refs.sequenceSection.style.background = backgroundColor;
      refs.sequenceStage.style.background = backgroundColor;
      refs.sequenceTail.style.background = backgroundColor;
      canvas.style.background = backgroundColor;

      if (sequencePanel) {
        sequencePanel.style.background = backgroundColor;
      }

      if (sticky) {
        sticky.style.background = backgroundColor;
      }

      if (refs.sequenceVideo) {
        refs.sequenceVideo.style.background = backgroundColor;
      }
    }

    function clearIntroTimers() {
      if (introExitTimer) {
        window.clearTimeout(introExitTimer);
        introExitTimer = 0;
      }
      if (introDestroyTimer) {
        window.clearTimeout(introDestroyTimer);
        introDestroyTimer = 0;
      }
    }

    function resetRefreshGesture() {
      refreshPullDistance = 0;
      refreshTriggered = false;
      touchPullStartY = null;
    }

    function preloadFrame(index) {
      if (frames[index]) {
        return frames[index];
      }

      const image = new Image();
      image.decoding = "async";
      image.loading = "eager";
      image.src = config.imageSequence.path(index);
      image.onload = () => {
        if (index === 0 || index === frameIndex || index === config.imageSequence.frameCount - 1) {
          queueRender();
        }
      };
      frames[index] = image;
      return image;
    }

    function preloadAllFrames() {
      for (let index = 0; index < config.imageSequence.frameCount; index += 1) {
        preloadFrame(index);
      }
    }

    function updateCanvasSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(Math.round(rect.width * dpr), 1);
      const nextHeight = Math.max(Math.round(rect.height * dpr), 1);

      if (nextWidth === canvasWidth && nextHeight === canvasHeight) {
        return;
      }

      canvasWidth = nextWidth;
      canvasHeight = nextHeight;
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }

    function drawImageContain(image) {
      if (!context || !image || !image.complete || !canvasWidth || !canvasHeight) {
        return;
      }

      const scale = Math.min(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const offsetX = (canvasWidth - drawWidth) * 0.5;
      const offsetY = (canvasHeight - drawHeight) * 0.5;

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      context.imageSmoothingEnabled = true;
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    }

    function render() {
      isRenderQueued = false;
      updateCanvasSize();
      const image = preloadFrame(frameIndex);
      if (!image.complete) {
        return;
      }
      drawImageContain(image);
    }

    function queueRender() {
      if (isRenderQueued) {
        return;
      }

      isRenderQueued = true;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(render);
    }

    function setTriggerVisible(isVisible) {
      if (!refs.sequenceTrigger) {
        return;
      }
      refs.sequenceTrigger.classList.toggle("is-visible", isVisible);
      refs.sequenceTrigger.setAttribute("aria-hidden", isVisible ? "false" : "true");
    }

    function setVideoVisible(isVisible) {
      if (!refs.sequenceVideo) {
        return;
      }
      refs.sequenceVideo.classList.toggle("is-visible", isVisible);
    }

    function lockForwardScroll() {
      if (refs.sequenceScroller.scrollTop > lockedScrollTop) {
        refs.sequenceScroller.scrollTop = lockedScrollTop;
      }
    }

    function handleLockedScrollGuard(event) {
      if (sequenceState !== "trigger" && sequenceState !== "video") {
        return;
      }

      const nextTop = refs.sequenceScroller.scrollTop;
      if (nextTop !== lockedScrollTop) {
        refs.sequenceScroller.scrollTop = lockedScrollTop;
      }

      if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
    }

    function setScrollLocked(isLocked) {
      if (isLocked) {
        refs.sequenceScroller.dataset.sequenceLocked = "true";
        refs.sequenceScroller.style.overscrollBehaviorY = "none";
        refs.sequenceScroller.style.touchAction = "none";
        refs.sequenceScroller.style.overflowY = "hidden";
        refs.sequenceScroller.scrollTop = lockedScrollTop;

        if (!scrollLockBound) {
          refs.sequenceScroller.addEventListener("wheel", handleLockedScrollGuard, { passive: false });
          refs.sequenceScroller.addEventListener("touchmove", handleLockedScrollGuard, { passive: false });
          scrollLockBound = true;
        }
        return;
      }

      delete refs.sequenceScroller.dataset.sequenceLocked;
      refs.sequenceScroller.style.overscrollBehaviorY = "contain";
      refs.sequenceScroller.style.touchAction = "pan-y";
      refs.sequenceScroller.style.overflowY = "auto";

      if (scrollLockBound) {
        refs.sequenceScroller.removeEventListener("wheel", handleLockedScrollGuard);
        refs.sequenceScroller.removeEventListener("touchmove", handleLockedScrollGuard);
        scrollLockBound = false;
      }
    }

    function pauseAndResetVideo() {
      if (!refs.sequenceVideo) {
        return;
      }

      refs.sequenceVideo.pause();
      refs.sequenceVideo.currentTime = 0;
      refs.sequenceVideo.muted = false;
      refs.sequenceVideo.volume = 1;
    }

    function hideIntroOverlay() {
      if (!refs.sequenceIntro) {
        return;
      }

      refs.sequenceIntro.classList.remove(
        "is-active",
        "is-leaving",
        "is-video-visible",
        "is-video-leaving",
        "is-awaiting-play"
      );

      if (refs.sequenceIntroPlay) {
        refs.sequenceIntroPlay.classList.remove("is-visible");
        refs.sequenceIntroPlay.setAttribute("aria-hidden", "true");
      }
    }

    function destroyIntro() {
      clearIntroTimers();

      if (refs.sequenceIntroVideo) {
        refs.sequenceIntroVideo.pause();
      }

      hideIntroOverlay();
      introDestroyed = false;
      sequenceState = "frames";
      refs.sequenceScroller.scrollTop = refs.sequenceSection.offsetTop;
      queueRender();
    }

    function finishIntroPlayback() {
      if (!refs.sequenceIntro || !refs.sequenceIntroVideo) {
        introPlayedOnce = true;
        introDestroyed = true;
        sequenceState = "frames";
        return;
      }

      introPlayedOnce = true;
      refs.sequenceIntro.classList.add("is-video-leaving");
      introExitTimer = window.setTimeout(() => {
        if (!refs.sequenceIntro) {
          return;
        }
        refs.sequenceIntro.classList.remove("is-video-visible");
        refs.sequenceIntro.classList.add("is-leaving");
      }, 40);

      introDestroyTimer = window.setTimeout(() => {
        destroyIntro();
      }, 460);
    }

    function resetIntroIfNeeded() {
      if (!refs.sequenceIntro || !refs.sequenceIntroVideo) {
        return;
      }

      clearIntroTimers();
      hideIntroOverlay();
      refs.sequenceIntroVideo.pause();
      refs.sequenceIntroVideo.currentTime = 0;
      refs.sequenceIntroVideo.muted = false;
      refs.sequenceIntroVideo.volume = 1;
    }

    function showIntroPlayFallback() {
      if (!refs.sequenceIntro || !refs.sequenceIntroPlay) {
        finishIntroPlayback();
        return;
      }

      refs.sequenceIntro.classList.add("is-awaiting-play");
      refs.sequenceIntroPlay.classList.add("is-visible");
      refs.sequenceIntroPlay.setAttribute("aria-hidden", "false");
    }

    function startIntroPlaybackFromUserGesture() {
      if (!refs.sequenceIntroVideo) {
        return;
      }

      refs.sequenceIntro?.classList.remove("is-awaiting-play");
      refs.sequenceIntroPlay?.classList.remove("is-visible");
      refs.sequenceIntroPlay?.setAttribute("aria-hidden", "true");
      refs.sequenceIntro.classList.add("is-video-visible");

      refs.sequenceIntroVideo.currentTime = 0;
      refs.sequenceIntroVideo.muted = false;
      refs.sequenceIntroVideo.volume = 1;

      const playPromise = refs.sequenceIntroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          showIntroPlayFallback();
        });
      }
    }

    function resumeIntroPlayback() {
      if (!refs.sequenceIntro || !refs.sequenceIntroVideo || introPlayedOnce) {
        return false;
      }

      clearIntroTimers();
      sequenceState = "intro";
      refs.sequenceIntro.classList.remove("is-leaving", "is-video-leaving", "is-awaiting-play");
      refs.sequenceIntro.classList.add("is-active", "is-video-visible");
      if (refs.sequenceIntroPlay) {
        refs.sequenceIntroPlay.classList.remove("is-visible");
        refs.sequenceIntroPlay.setAttribute("aria-hidden", "true");
      }

      const playPromise = refs.sequenceIntroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          refs.sequenceIntro.classList.remove("is-video-visible");
          showIntroPlayFallback();
        });
      }
      return true;
    }

    function playIntroIfNeeded() {
      if (!refs.sequenceIntro || !refs.sequenceIntroVideo || introPlayedOnce || introDestroyed) {
        return false;
      }

      clearIntroTimers();
      sequenceState = "intro";
      refs.sequenceScroller.scrollTop = 0;
      refs.sequenceIntro.classList.remove("is-leaving", "is-video-leaving");
      refs.sequenceIntro.classList.remove("is-awaiting-play");
      refs.sequenceIntro.classList.add("is-active");
      refs.sequenceIntroVideo.currentTime = 0;
      refs.sequenceIntroVideo.muted = false;
      refs.sequenceIntroVideo.volume = 1;
      refs.sequenceIntro.classList.add("is-video-visible");
      if (refs.sequenceIntroPlay) {
        refs.sequenceIntroPlay.classList.remove("is-visible");
        refs.sequenceIntroPlay.setAttribute("aria-hidden", "true");
      }
      const playPromise = refs.sequenceIntroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          refs.sequenceIntro.classList.remove("is-video-visible");
          showIntroPlayFallback();
        });
      }
      return true;
    }

    function refreshSequenceExperience() {
      introPlayedOnce = false;
      introDestroyed = false;
      videoHasUnlocked = false;
      sequenceState = "frames";
      lockedScrollTop = 0;
      frameIndex = config.imageSequence.frameCount - 1;

      setScrollLocked(false);
      setTriggerVisible(false);
      setVideoVisible(false);
      pauseAndResetVideo();
      resetIntroIfNeeded();

      refs.sequenceScroller.scrollTop = 0;
      queueRender();
      resetRefreshGesture();
      playIntroIfNeeded();
    }

    function unlockSequence() {
      if (videoHasUnlocked) {
        return;
      }
      videoHasUnlocked = true;
      setScrollLocked(false);
      if (refs.sequenceVideo) {
        refs.sequenceVideo.pause();
        if (Number.isFinite(refs.sequenceVideo.duration) && refs.sequenceVideo.duration > 0) {
          refs.sequenceVideo.currentTime = clamp(
            videoHoldTimeSeconds,
            0,
            refs.sequenceVideo.duration
          );
        }
      }
      sequenceState = "done";
      setTriggerVisible(false);
    }

    function showTrigger() {
      sequenceState = "trigger";
      lockedScrollTop = refs.sequenceSection.offsetTop + getSequenceRange();
      setScrollLocked(true);
      setTriggerVisible(true);
      setVideoVisible(false);
      pauseAndResetVideo();
    }

    function playRevealVideo() {
      if (!refs.sequenceVideo || sequenceState === "video" || sequenceState === "done") {
        return;
      }

      sequenceState = "video";
      setScrollLocked(true);
      setTriggerVisible(false);
      setVideoVisible(true);
      const playPromise = refs.sequenceVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          sequenceState = "trigger";
          setVideoVisible(false);
          setTriggerVisible(true);
        });
      }
    }

    function maybeEnterTriggerState(progress) {
      if (sequenceState !== "frames" || progress < 0.999) {
        return;
      }

      frameIndex = 0;
      queueRender();
      showTrigger();
    }

    function updateFrameFromScroll() {
      if (sequenceState === "intro") {
        refs.sequenceScroller.scrollTop = 0;
        return;
      }

      const progress = getProgress();

      if (sequenceState === "trigger" || sequenceState === "video") {
        return;
      }

      maybeEnterTriggerState(progress);

      if (sequenceState !== "frames") {
        return;
      }

      const nextFrame = Math.round((1 - progress) * (config.imageSequence.frameCount - 1));

      if (nextFrame === frameIndex) {
        return;
      }

      frameIndex = nextFrame;
      queueRender();
    }

    function handleScroll() {
      updateFrameFromScroll();
    }

    function handleRefreshWheel(event) {
      if (refs.sequenceScroller.scrollTop > 0) {
        resetRefreshGesture();
        return;
      }

      if (event.deltaY >= 0) {
        resetRefreshGesture();
        return;
      }

      refreshPullDistance = clamp(refreshPullDistance + Math.abs(event.deltaY), 0, refreshThreshold + 80);

      if (refreshTriggered || refreshPullDistance < refreshThreshold) {
        return;
      }

      refreshTriggered = true;
      event.preventDefault();
      refreshSequenceExperience();
    }

    function handleRefreshTouchStart(event) {
      if (refs.sequenceScroller.scrollTop > 0) {
        touchPullStartY = null;
        return;
      }

      touchPullStartY = event.touches && event.touches[0] ? event.touches[0].clientY : null;
    }

    function handleRefreshTouchMove(event) {
      if (touchPullStartY == null || refs.sequenceScroller.scrollTop > 0) {
        return;
      }

      const nextY = event.touches && event.touches[0] ? event.touches[0].clientY : null;
      if (nextY == null) {
        return;
      }

      const pullDistance = Math.max(nextY - touchPullStartY, 0);
      refreshPullDistance = clamp(pullDistance, 0, refreshThreshold + 80);

      if (refreshTriggered || refreshPullDistance < refreshThreshold) {
        return;
      }

      refreshTriggered = true;
      event.preventDefault();
      refreshSequenceExperience();
    }

    function handleRefreshTouchEnd() {
      resetRefreshGesture();
    }

    function handleResize() {
      if (!isInitialized) {
        return;
      }
      queueRender();
      updateFrameFromScroll();
    }

    function reset() {
      if (!isInitialized) {
        return;
      }

      resetIntroIfNeeded();
      sequenceState = "frames";
      videoHasUnlocked = false;
      lockedScrollTop = 0;
      frameIndex = config.imageSequence.frameCount - 1;
      setScrollLocked(false);

      setTriggerVisible(false);
      setVideoVisible(false);
      pauseAndResetVideo();
      refs.sequenceScroller.scrollTop = refs.sequenceSection.offsetTop;
      queueRender();
    }

    function ensureReady() {
      if (isInitialized) {
        return;
      }

      isInitialized = true;
      applyBackgroundColor();
      preloadAllFrames();
      frameIndex = config.imageSequence.frameCount - 1;
      queueRender();
      pauseAndResetVideo();

      if (refs.sequenceVideo && !videoEndedHandlerBound) {
        refs.sequenceVideo.addEventListener("ended", unlockSequence);
        videoEndedHandlerBound = true;
      }

      if (refs.sequenceTrigger && !triggerBound) {
        refs.sequenceTrigger.addEventListener("click", playRevealVideo);
        triggerBound = true;
      }

      if (refs.sequenceIntroVideo && !refs.sequenceIntroVideo.dataset.boundEnded) {
        refs.sequenceIntroVideo.addEventListener("ended", finishIntroPlayback);
        refs.sequenceIntroVideo.dataset.boundEnded = "true";
      }

      if (refs.sequenceIntroPlay && !introPlayBound) {
        refs.sequenceIntroPlay.addEventListener("click", startIntroPlaybackFromUserGesture);
        introPlayBound = true;
      }
    }

    function init() {
      refs.sequenceScroller.addEventListener("scroll", () => {
        ensureReady();
        handleScroll();
      }, { passive: true });
      refs.sequenceScroller.addEventListener("wheel", handleRefreshWheel, { passive: false });
      refs.sequenceScroller.addEventListener("touchstart", handleRefreshTouchStart, { passive: true });
      refs.sequenceScroller.addEventListener("touchmove", handleRefreshTouchMove, { passive: false });
      refs.sequenceScroller.addEventListener("touchend", handleRefreshTouchEnd, { passive: true });
      refs.sequenceScroller.addEventListener("touchcancel", handleRefreshTouchEnd, { passive: true });
    }

    return {
      init,
      ensureReady,
      handleResize,
      reset,
      handlePanelEnter() {
        ensureReady();
        if (sequenceState === "intro-paused") {
          resumeIntroPlayback();
          return;
        }

        if (sequenceState === "video" && refs.sequenceVideo && !videoHasUnlocked) {
          const playPromise = refs.sequenceVideo.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
          return;
        }

        if (!introPlayedOnce) {
          playIntroIfNeeded();
        }
      },
      handlePanelExit() {
        if (sequenceState === "intro") {
          refs.sequenceIntroVideo?.pause();
          hideIntroOverlay();
          sequenceState = "intro-paused";
        }

        if (sequenceState === "video") {
          refs.sequenceVideo?.pause();
        }
      },
    };
  };
})();
