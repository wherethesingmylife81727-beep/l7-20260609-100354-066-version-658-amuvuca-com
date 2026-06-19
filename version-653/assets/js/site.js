(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    if (header) {
        var syncHeader = function () {
            header.classList.toggle('scrolled', window.scrollY > 12);
        };
        syncHeader();
        window.addEventListener('scroll', syncHeader, { passive: true });
    }

    var sliders = document.querySelectorAll('[data-hero-slider]');
    sliders.forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var next = slider.querySelector('[data-hero-next]');
        var prev = slider.querySelector('[data-hero-prev]');
        var index = 0;

        if (!slides.length) {
            return;
        }

        var show = function (target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
        };

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }

        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    });

    var searchInput = document.querySelector('[data-page-search]');
    var clearButton = document.querySelector('[data-search-clear]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var noResults = document.querySelector('[data-no-results]');

    var filterCards = function () {
        if (!searchInput) {
            return;
        }

        var value = searchInput.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
            var data = (card.getAttribute('data-search') || '').toLowerCase();
            var matched = !value || data.indexOf(value) !== -1;
            card.classList.toggle('hidden-by-search', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.classList.toggle('show', visible === 0);
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (clearButton && searchInput) {
        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            filterCards();
            searchInput.focus();
        });
    }
})();
