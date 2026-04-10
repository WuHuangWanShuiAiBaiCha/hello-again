(function () {
  function boot() {
    if (window.HelloAgain && typeof window.HelloAgain.initApp === "function") {
      window.HelloAgain.initApp();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
