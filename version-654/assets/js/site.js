(function() {
    var body = document.body;
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');

    function setHeaderState() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });

    if (menuButton) {
        menuButton.addEventListener('click', function() {
            body.classList.toggle('menu-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                show(i);
                start();
            });
        });

        show(0);
        start();
    }

    function setupSearch() {
        var input = document.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
        var chipValue = '';

        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
        }

        function filter() {
            var query = input ? normalize(input.value) : '';
            var active = normalize(chipValue);
            var shown = 0;
            cards.forEach(function(card) {
                var text = cardText(card);
                var hitQuery = !query || text.indexOf(query) !== -1;
                var hitChip = !active || active === normalize('全部') || text.indexOf(active) !== -1;
                var visible = hitQuery && hitChip;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', cards.length > 0 && shown === 0);
            }
        }

        if (input) {
            input.addEventListener('input', filter);
        }

        chips.forEach(function(chip) {
            chip.addEventListener('click', function() {
                var value = chip.getAttribute('data-filter-chip') || '';
                chipValue = chipValue === value ? '' : value;
                chips.forEach(function(item) {
                    item.classList.toggle('is-active', item === chip && chipValue === value);
                });
                filter();
            });
        });

        filter();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function(frame) {
            var video = frame.querySelector('video');
            var button = frame.querySelector('[data-play-button]');
            var source = frame.getAttribute('data-m3u8');
            var connected = false;
            var hlsInstance = null;

            function connect() {
                if (!video || !source || connected) {
                    return;
                }
                connected = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 60
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                connect();
                frame.classList.add('is-playing');
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function() {
                        frame.classList.remove('is-playing');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function(event) {
                    event.preventDefault();
                    play();
                });
            }

            if (video) {
                video.addEventListener('play', function() {
                    frame.classList.add('is-playing');
                });
                video.addEventListener('pause', function() {
                    if (!video.currentTime) {
                        frame.classList.remove('is-playing');
                    }
                });
            }
        });
    }

    setupHero();
    setupSearch();
    setupPlayers();
})();
