(function () {
  var menuButton = document.querySelector(".mobile-menu-button");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll(".site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      if (!value) {
        return;
      }
      var target = form.getAttribute("data-search-target") || "search.html";
      window.location.href = target + "?q=" + encodeURIComponent(value);
    });
  });

  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 420) {
        backToTop.classList.add("is-visible");
      } else {
        backToTop.classList.remove("is-visible");
      }
    });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }
    showSlide(0);
    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyLocalFilter() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] .movie-card"));
    if (!cards.length) {
      return;
    }
    var searchInput = document.querySelector("[data-local-search]");
    var yearSelect = document.querySelector("[data-local-year]");
    var regionSelect = document.querySelector("[data-local-region]");
    var query = normalize(searchInput && searchInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-tags"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var visible = true;
      if (query && text.indexOf(query) === -1) {
        visible = false;
      }
      if (year && cardYear !== year) {
        visible = false;
      }
      if (region && cardRegion !== region) {
        visible = false;
      }
      card.hidden = !visible;
    });
  }

  ["[data-local-search]", "[data-local-year]", "[data-local-region]"].forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (element) {
      element.addEventListener("input", applyLocalFilter);
      element.addEventListener("change", applyLocalFilter);
    });
  });

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a href=\"" + escapeHtml(item.link) + "\" class=\"movie-card-link\">" +
      "<div class=\"poster-frame\">" +
      "<img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHtml(item.region) + "</span>" +
      "<span class=\"poster-year\">" + escapeHtml(item.year) + "</span>" +
      "</div>" +
      "<div class=\"movie-card-body\">" +
      "<h3>" + escapeHtml(item.title) + "</h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.genre) + "</span></div>" +
      "<div class=\"card-tags\">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var results = document.getElementById("searchResults");
  var summary = document.getElementById("searchSummary");
  if (results && summary && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var q = normalize(params.get("q"));
    var source = window.MOVIE_INDEX;
    var list = q ? source.filter(function (item) {
      var text = normalize([item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(" "), item.oneLine].join(" "));
      return text.indexOf(q) !== -1;
    }) : source.slice(0, 48);

    if (q) {
      summary.textContent = list.length ? "搜索结果：" + params.get("q") : "没有找到相关影片";
    } else {
      summary.textContent = "热门影片推荐";
    }
    results.innerHTML = list.slice(0, 240).map(cardTemplate).join("");
  }
}());
