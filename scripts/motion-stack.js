(function () {
  window.HelloAgain = window.HelloAgain || {};

  const motion = (window.HelloAgain.motion = window.HelloAgain.motion || {});
  const gsap = window.gsap || null;
  const scrollTrigger = window.ScrollTrigger || null;
  const lenis = window.Lenis || null;
  const barba = window.barba || null;
  const theatre = window.Theatre || window.theatre || null;

  if (gsap && scrollTrigger) {
    try {
      gsap.registerPlugin(scrollTrigger);
    } catch (error) {
      console.warn("Failed to register ScrollTrigger", error);
    }
  }

  motion.libs = {
    gsap,
    ScrollTrigger: scrollTrigger,
    Lenis: lenis,
    barba,
    Theatre: theatre,
    r3fScrollRig: null,
  };

  motion.notes = {
    r3fScrollRig:
      "Requires a React and @react-three/fiber build pipeline, so it is intentionally left as a future migration target for this static Unicorn site.",
  };
  motion.usesGsapHomeTransition = false;

  const { clamp, viewportWidth } = window.HelloAgain.utils || {};

  window.HelloAgain.createMotionController = function createMotionController(refs) {
    let lenisInstance = null;
    let lenisFrame = 0;
    let seriesTween = null;
    let homeMotionEnabled = false;
    let homeTimeline = null;

    function setupLenis() {
      if (!lenis || motion.lenis) {
        return motion.lenis || null;
      }

      lenisInstance = new lenis({
        lerp: 0.068,
        smoothWheel: true,
        wheelMultiplier: 0.84,
        touchMultiplier: 1,
        syncTouch: false,
        prevent(node) {
          return !!(node && typeof node.closest === "function" && node.closest("#series-shell"));
        },
      });

      function onFrame(time) {
        lenisInstance.raf(time);
        lenisFrame = window.requestAnimationFrame(onFrame);
      }

      lenisFrame = window.requestAnimationFrame(onFrame);

      lenisInstance.on("scroll", () => {
        if (scrollTrigger) {
          scrollTrigger.update();
        }
      });

      motion.lenis = lenisInstance;
      return lenisInstance;
    }

    function setupHomeMotion() {
      if (
        !gsap ||
        !scrollTrigger ||
        homeMotionEnabled ||
        !refs.scrollTransition ||
        !refs.sceneStage ||
        !refs.nextPage
      ) {
        return;
      }

      homeMotionEnabled = true;
      motion.usesGsapHomeTransition = true;

      gsap.set(refs.sceneStage, {
        autoAlpha: 1,
        scale: 1,
        filter: "blur(0px) saturate(1)",
      });

      gsap.set(refs.nextPage, {
        autoAlpha: 0.02,
      });

      gsap.set(refs.nextScene || refs.nextPage, {
        y: 112,
        filter: "blur(8px) saturate(0.88)",
      });

      homeTimeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: refs.scrollTransition,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.15,
        },
      });

      homeTimeline
        .to(
          refs.sceneStage,
          {
            autoAlpha: 0.015,
            scale: 0.93,
            filter: "blur(10px) saturate(0.72)",
          },
          0
        )
        .to(
          refs.nextPage,
          {
            autoAlpha: 1,
          },
          0.24
        )
        .to(
          refs.nextScene || refs.nextPage,
          {
            y: 0,
            filter: "blur(0px) saturate(1)",
          },
          0.24
        );
    }

    function updateSeriesTrackEffects() {
      if (!gsap || !refs.seriesTrack || !refs.seriesPanels?.length || !clamp) {
        return;
      }

      refs.seriesPanels.forEach((panel, index) => {
        if (index === 0) {
          return;
        }

        const scroller = panel.querySelector(".series-panel__scroller");
        const body = panel.querySelector(".series-panel__body");
        const dock = panel.querySelector(".series-dock");

        if (scroller) {
          gsap.set(scroller, {
            opacity: 1,
            force3D: true,
          });
        }

        if (body) {
          gsap.set(body, {
            x: 0,
            scale: 1,
            opacity: 1,
            filter: "none",
            force3D: true,
            transformOrigin: "50% 50%",
          });
        }

        if (dock) {
          gsap.set(dock, {
            x: 0,
            opacity: 1,
            force3D: true,
          });
        }
      });
    }

    function tweenSeriesTo(panelIndex, options) {
      if (!refs.seriesTrack || !gsap) {
        return null;
      }

      if (seriesTween) {
        seriesTween.kill();
      }

      const targetLeft = viewportWidth() * panelIndex;
      const duration = (options && options.duration) || 0.72;
      const ease = (options && options.ease) || "power3.out";

      seriesTween = gsap.to(refs.seriesTrack, {
        scrollLeft: targetLeft,
        duration,
        ease,
        overwrite: "auto",
        onStart: updateSeriesTrackEffects,
        onUpdate: updateSeriesTrackEffects,
        onComplete: () => {
          updateSeriesTrackEffects();
          seriesTween = null;
          if (options && typeof options.onComplete === "function") {
            options.onComplete();
          }
        },
      });

      return seriesTween;
    }

    function handleResize() {
      updateSeriesTrackEffects();
      if (scrollTrigger) {
        scrollTrigger.refresh();
      }
    }

    function init() {
      setupLenis();
      setupHomeMotion();
      updateSeriesTrackEffects();
    }

    function destroy() {
      if (seriesTween) {
        seriesTween.kill();
        seriesTween = null;
      }

      if (homeTimeline) {
        homeTimeline.kill();
        homeTimeline = null;
      }

      if (lenisFrame) {
        window.cancelAnimationFrame(lenisFrame);
        lenisFrame = 0;
      }

      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
    }

    return {
      init,
      destroy,
      handleResize,
      updateSeriesTrackEffects,
      tweenSeriesTo,
    };
  };
})();
