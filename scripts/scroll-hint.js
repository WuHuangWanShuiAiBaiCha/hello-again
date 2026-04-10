(function () {
  window.HelloAgain = window.HelloAgain || {};

  const { config } = window.HelloAgain;

  window.HelloAgain.createScrollHintController = function createScrollHintController(refs) {
    let helloHintTimer = 0;

    function getHelloProgress() {
      return window.scrollY / Math.max(window.innerHeight, 1);
    }

    function isPastHelloPage() {
      return getHelloProgress() >= config.helloPageProgressThreshold;
    }

    function clearHelloHintTimer() {
      if (!helloHintTimer) {
        return;
      }

      window.clearTimeout(helloHintTimer);
      helloHintTimer = 0;
    }

    function showHelloHint() {
      if (!refs.helloScrollHint || isPastHelloPage()) {
        return;
      }

      refs.helloScrollHint.classList.add("is-visible");
    }

    function hideHelloHint() {
      if (!refs.helloScrollHint) {
        return;
      }

      refs.helloScrollHint.classList.remove("is-visible");
    }

    function scheduleHelloHint() {
      if (!refs.helloScrollHint || isPastHelloPage()) {
        return;
      }

      clearHelloHintTimer();
      helloHintTimer = window.setTimeout(() => {
        helloHintTimer = 0;
        showHelloHint();
      }, config.helloHintDelayMs);
    }

    function markHelloScrollInteraction() {
      clearHelloHintTimer();
      hideHelloHint();

      if (isPastHelloPage()) {
        return;
      }

      scheduleHelloHint();
    }

    return {
      markHelloScrollInteraction,
      scheduleHelloHint,
    };
  };
})();
