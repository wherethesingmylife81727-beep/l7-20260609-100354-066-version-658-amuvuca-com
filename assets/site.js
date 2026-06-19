(() => {
  const mobileButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const target = form.getAttribute('data-target') || 'search.html';
      const query = input ? input.value.trim() : '';
      const url = query ? `${target}?q=${encodeURIComponent(query)}` : target;
      window.location.href = url;
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    const setSlide = (index) => {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => setSlide(current + 1), 5600);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        setSlide(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', () => window.clearInterval(timer));
    hero.addEventListener('mouseleave', start);
    setSlide(0);
    start();
  }

  const filterBox = document.querySelector('[data-filter-box]');
  if (filterBox) {
    const searchInput = filterBox.querySelector('[data-card-search]');
    const typeSelect = filterBox.querySelector('[data-type-filter]');
    const yearSelect = filterBox.querySelector('[data-year-filter]');
    const categorySelect = filterBox.querySelector('[data-category-filter]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const applyFilters = () => {
      const keyword = normalize(searchInput ? searchInput.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const category = normalize(categorySelect ? categorySelect.value : '');

      cards.forEach((card) => {
        const text = normalize(`${card.dataset.title || ''} ${card.dataset.meta || ''}`);
        const cardType = normalize(card.dataset.type || '');
        const cardYear = normalize(card.dataset.year || '');
        const cardCategory = normalize(card.dataset.category || '');
        const matched = (!keyword || text.includes(keyword)) &&
          (!type || cardType === type) &&
          (!year || cardYear === year) &&
          (!category || cardCategory === category);
        card.hidden = !matched;
      });
    };

    [searchInput, typeSelect, yearSelect, categorySelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('.player-start');
    const stream = player.getAttribute('data-stream');
    let prepared = false;
    let hls = null;

    const prepare = () => {
      if (prepared || !video || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      prepared = true;
    };

    const play = () => {
      prepare();
      player.classList.add('is-playing');
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          player.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (!prepared) {
          play();
        }
      });
      video.addEventListener('play', () => player.classList.add('is-playing'));
      video.addEventListener('pause', () => {
        if (!video.currentTime) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', () => {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
