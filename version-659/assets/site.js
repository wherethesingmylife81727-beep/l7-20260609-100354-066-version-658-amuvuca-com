(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    initHero();
    initCategoryFilter();
    initSearchPage();
  });

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }

    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === active);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        show(pos);
        start();
      });
    });

    show(0);
    start();
  }

  function initCategoryFilter() {
    var form = document.querySelector('[data-filter-bar]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!form || !grid) {
      return;
    }

    var input = form.querySelector('[name="keyword"]');
    var year = form.querySelector('[name="year"]');
    var region = form.querySelector('[name="region"]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function apply() {
      var keywordValue = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || ''
        ].join(' ').toLowerCase();
        var matchedKeyword = !keywordValue || haystack.indexOf(keywordValue) > -1;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchedRegion = !regionValue || (card.getAttribute('data-region') || '').indexOf(regionValue) > -1;
        card.style.display = matchedKeyword && matchedYear && matchedRegion ? '' : 'none';
      });
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, apply);
    });
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    if (!results || !input || !Array.isArray(window.MOVIES_SEARCH)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function createCard(movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.innerHTML = [
        '<a class="poster-link" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="play-badge">播放</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '</div>'
      ].join('');
      return article;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      results.innerHTML = '';
      if (!query) {
        var empty = document.createElement('div');
        empty.className = 'search-state';
        empty.textContent = '输入片名、地区、年份或标签即可检索片库。';
        results.appendChild(empty);
        return;
      }

      var matched = window.MOVIES_SEARCH.filter(function (movie) {
        return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.category, movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(query) > -1;
      }).slice(0, 120);

      if (!matched.length) {
        var none = document.createElement('div');
        none.className = 'search-state';
        none.textContent = '没有匹配到相关影片，换一个关键词试试。';
        results.appendChild(none);
        return;
      }

      matched.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });
    }

    input.addEventListener('input', render);
    render();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-play-button]');
    if (!video || !source) {
      return;
    }

    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
    }

    function start() {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    function bindStart(target) {
      if (target) {
        target.addEventListener('click', function (event) {
          event.preventDefault();
          start();
        });
      }
    }

    bindStart(cover);
    bindStart(button);
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
