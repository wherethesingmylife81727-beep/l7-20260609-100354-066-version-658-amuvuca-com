document.addEventListener('DOMContentLoaded', function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('open');
      mobileButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.getElementById('heroSlider');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var clear = form.querySelector('[data-filter-clear]');
    var grid = document.querySelector('[data-filter-grid]');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        card.hidden = keyword && text.indexOf(keyword) === -1;
      });
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        filterCards();
      });
    }
  });

  var searchForm = document.querySelector('[data-search-page-form]');
  var searchGrid = document.querySelector('[data-search-grid]');

  if (searchForm && searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var keywordInput = searchForm.querySelector('[data-search-input]');
    var regionSelect = searchForm.querySelector('[data-region-filter]');
    var yearSelect = searchForm.querySelector('[data-year-filter]');
    var categorySelect = searchForm.querySelector('[data-category-filter]');
    var reset = searchForm.querySelector('[data-search-reset]');
    var searchCards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));

    if (keywordInput && params.get('q')) {
      keywordInput.value = params.get('q');
    }

    function applySearch() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';

      searchCards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        var visible = true;

        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }
        if (region && cardRegion !== region) {
          visible = false;
        }
        if (year && cardYear !== year) {
          visible = false;
        }
        if (category && cardCategory !== category) {
          visible = false;
        }

        card.hidden = !visible;
      });
    }

    [keywordInput, regionSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        applySearch();
      });
    }

    applySearch();
  }

  document.querySelectorAll('.stream-player').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !stream || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        ready = true;
        return;
      }

      video.src = stream;
      ready = true;
    }

    function playVideo() {
      attachStream();
      player.classList.add('is-playing');
      if (video) {
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
