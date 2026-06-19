(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var menuButton = $('.menu-toggle');
  var mobilePanel = $('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var hidden = mobilePanel.hasAttribute('hidden');
      if (hidden) {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      } else {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var slides = $all('.hero-slide');
  var dots = $all('.hero-dot');
  var heroIndex = 0;
  var timer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  if (slides.length) {
    var prev = $('.hero-prev');
    var next = $('.hero-next');
    if (prev) {
      prev.addEventListener('click', function () {
        showHero(heroIndex - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showHero(heroIndex + 1);
        startHero();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(parseInt(dot.getAttribute('data-hero-index'), 10));
        startHero();
      });
    });
    startHero();
  }

  var cards = $all('.movie-card, .rank-row');
  var localInput = $('.local-filter');
  var yearFilter = $('.year-filter');
  var regionFilter = $('.region-filter');

  function fillSelect(select, attr) {
    if (!select || !cards.length) {
      return;
    }
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(attr);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort().reverse().forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function filterCards() {
    var q = normalize(localInput ? localInput.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var region = regionFilter ? regionFilter.value : '';
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' '));
      var ok = true;
      if (q && haystack.indexOf(q) === -1) {
        ok = false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        ok = false;
      }
      if (region && card.getAttribute('data-region') !== region) {
        ok = false;
      }
      card.classList.toggle('is-hidden-card', !ok);
    });
  }

  if (cards.length) {
    fillSelect(yearFilter, 'data-year');
    fillSelect(regionFilter, 'data-region');
  }

  if (localInput) {
    localInput.addEventListener('input', filterCards);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }
  if (regionFilter) {
    regionFilter.addEventListener('change', filterCards);
  }

  var backTop = $('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 480);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearch() {
    var results = $('#searchResults');
    var status = $('#searchStatus');
    if (!results || !status || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q'));
    var formInput = $('.search-page-form input[name="q"]');
    if (formInput) {
      formInput.value = params.get('q') || '';
    }
    if (!query) {
      results.innerHTML = '';
      status.textContent = '输入关键词即可开始搜索。';
      return;
    }
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      return normalize(movie.title + ' ' + movie.region + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine).indexOf(query) !== -1;
    }).slice(0, 120);
    status.textContent = matched.length ? '搜索结果' : '没有找到匹配内容。';
    results.innerHTML = matched.map(function (movie) {
      return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '">' +
        '<a href="' + escapeHtml(movie.page) + '" class="card-link" aria-label="' + escapeHtml(movie.title) + '">' +
          '<div class="poster-wrap">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<div class="poster-mask"></div>' +
            '<span class="play-dot">▶</span>' +
            '<div class="poster-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
          '</div>' +
          '<div class="card-content">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '</div>' +
        '</a>' +
      '</article>';
    }).join('');
  }

  renderSearch();
})();
