const pageTrack = document.querySelector(".page-track");
const pages = Array.from(document.querySelectorAll(".page"));
const dots = Array.from(document.querySelectorAll(".dot"));
const arrowLeft = document.querySelector(".arrow-left");
const arrowRight = document.querySelector(".arrow-right");
const productNames = Array.from(document.querySelectorAll(".product-name"));
const titledVideos = Array.from(document.querySelectorAll(".hero-screen .video-title")).map((title) => ({
  title,
  hero: title.closest(".hero-screen"),
  video: title.closest(".hero-screen").querySelector("video")
}));

const pageHashes = ["home", "pro", "air", "mini-ultra", "store"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentPage = -1;
let isSwitching = false;
let touchStartX = 0;
let touchStartY = 0;
let wheelLock = false;

function pageFromHash() {
  const hash = window.location.hash.replace("#", "");
  const found = pageHashes.indexOf(hash);
  if (found >= 0) {
    return found;
  }

  const startPage = Number(document.body.dataset.startPage || 0);
  return Number.isInteger(startPage) && startPage >= 0 && startPage < pageHashes.length ? startPage : 0;
}

function updatePage(nextPage, historyMode = "push") {
  if (nextPage < 0 || nextPage >= pages.length || nextPage === currentPage) {
    return;
  }

  currentPage = nextPage;
  isSwitching = true;
  pageTrack.style.transform = `translateX(-${currentPage * 100}vw)`;

  pages.forEach((page, index) => {
    page.classList.toggle("active", index === currentPage);
  });

  titledVideos.forEach(({ hero }) => {
    hero.classList.remove("title-visible");
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentPage);
  });

  const activeScroll = pages[currentPage].querySelector(".page-scroll");
  if (activeScroll) {
    activeScroll.scrollTop = 0;
  }

  arrowLeft.disabled = currentPage === 0;
  arrowRight.disabled = currentPage === pages.length - 1;

  const pageHash = `#${pageHashes[currentPage]}`;
  if (historyMode === "push" && window.location.hash !== pageHash) {
    history.pushState({ applePage: currentPage }, "", pageHash);
  } else if (historyMode === "replace") {
    history.replaceState({ applePage: currentPage }, "", pageHash);
  }

  syncVideos();

  window.setTimeout(() => {
    isSwitching = false;
  }, 860);
}

function syncVideos() {
  document.querySelectorAll("video").forEach((video) => {
    const isActive = video.closest(".page")?.classList.contains("active");
    if (reduceMotion || !isActive) {
      video.pause();
      return;
    }

    video.muted = true;
    video.play().catch(() => {});
  });
}

function syncVideoTitle(video, hero) {
  if (!video.duration || Number.isNaN(video.duration)) {
    hero.classList.remove("title-visible");
    return;
  }

  const showTitle = video.duration - video.currentTime <= 3;
  hero.classList.toggle("title-visible", showTitle);
}

function goToPage(nextPage) {
  if (!isSwitching) {
    updatePage(nextPage);
  }
}

function goNext() {
  goToPage(currentPage + 1);
}

function goPrev() {
  goToPage(currentPage - 1);
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    goToPage(Number(button.dataset.page));
  });
});

arrowLeft.addEventListener("click", goPrev);
arrowRight.addEventListener("click", goNext);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    goNext();
  }
  if (event.key === "ArrowLeft") {
    goPrev();
  }
});

window.addEventListener(
  "wheel",
  (event) => {
    if (wheelLock || isSwitching) {
      return;
    }

    if (Math.abs(event.deltaX) < 36 || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.4) {
      return;
    }

    wheelLock = true;
    event.deltaX > 0 ? goNext() : goPrev();

    window.setTimeout(() => {
      wheelLock = false;
    }, 980);
  },
  { passive: true }
);

document.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: true }
);

document.addEventListener(
  "touchend",
  (event) => {
    const touch = event.changedTouches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    if (Math.abs(diffX) < 52 || Math.abs(diffX) < Math.abs(diffY) * 1.15) {
      return;
    }

    diffX < 0 ? goNext() : goPrev();
  },
  { passive: true }
);

productNames.forEach((item) => {
  item.addEventListener("click", () => {
    productNames.forEach((name) => name.classList.remove("active"));
    item.classList.add("active");
  });
});

titledVideos.forEach(({ video, hero }) => {
  if (!video || !hero) {
    return;
  }

  video.addEventListener("timeupdate", () => {
    syncVideoTitle(video, hero);
  });

  video.addEventListener("loadedmetadata", () => {
    syncVideoTitle(video, hero);
  });

  video.addEventListener("seeked", () => {
    syncVideoTitle(video, hero);
  });
});

window.addEventListener("hashchange", () => {
  updatePage(pageFromHash(), "none");
});

window.addEventListener("popstate", () => {
  updatePage(pageFromHash(), "none");
});

if (reduceMotion) {
  document.querySelectorAll("video").forEach((video) => video.pause());
}

pageTrack.style.transition = "none";
updatePage(pageFromHash(), "replace");
isSwitching = false;
window.requestAnimationFrame(() => {
  pageTrack.style.transition = "";
});
