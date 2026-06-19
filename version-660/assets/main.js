(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
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

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

        scopes.forEach(function (scope) {
            var section = scope.parentElement;
            if (!section) {
                return;
            }

            var searchInput = scope.querySelector('[data-search-input]');
            var yearFilter = scope.querySelector('[data-year-filter]');
            var categoryFilter = scope.querySelector('[data-category-filter]');
            var emptyState = scope.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));

            function apply() {
                var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
                var year = yearFilter ? yearFilter.value : '';
                var category = categoryFilter ? categoryFilter.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchYear = !year || card.getAttribute('data-year') === year;
                    var matchCategory = !category || card.getAttribute('data-category') === category;
                    var matched = matchQuery && matchYear && matchCategory;

                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle('is-visible', visible === 0);
                }
            }

            if (searchInput) {
                searchInput.addEventListener('input', apply);
            }
            if (yearFilter) {
                yearFilter.addEventListener('change', apply);
            }
            if (categoryFilter) {
                categoryFilter.addEventListener('change', apply);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupFilters();
    });
}());
