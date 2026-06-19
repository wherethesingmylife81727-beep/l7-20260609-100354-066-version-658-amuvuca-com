(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    const button = document.querySelector("[data-mobile-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      const expanded = nav.classList.contains("open");
      button.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const dotIndex = Number(dot.getAttribute("data-hero-dot"));
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function getQuery() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function setupSearchPage() {
    const grid = document.querySelector("[data-search-grid]");
    const input = document.querySelector("[data-local-search]");
    if (!grid || !input) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const empty = document.querySelector("[data-no-results]");

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function filter(value) {
      const keyword = normalize(value).trim();
      let visible = 0;
      cards.forEach(function (card) {
        const text = normalize(card.getAttribute("data-search") || card.textContent);
        const matched = keyword === "" || text.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    const initialQuery = getQuery();
    input.value = initialQuery;
    filter(initialQuery);
    input.addEventListener("input", function () {
      filter(input.value);
    });
  }

  function setupPlayer() {
    const box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }
    const video = box.querySelector("video");
    const overlay = box.querySelector(".play-overlay");
    const streamUrl = box.getAttribute("data-stream");
    let attached = false;
    let hls = null;

    function attachMedia() {
      if (attached || !video || !streamUrl) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      attachMedia();
      box.classList.add("is-playing");
      if (overlay) {
        overlay.setAttribute("aria-hidden", "true");
      }
      if (video) {
        video.controls = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!attached) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupSearchPage();
    setupPlayer();
  });
})();
