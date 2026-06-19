(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
            return;
        }
        fn();
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        start();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var input = root.querySelector("[data-filter-input]");
            var type = root.querySelector("[data-filter-type]");
            var year = root.querySelector("[data-filter-year]");
            var category = root.querySelector("[data-filter-category]");
            var status = root.querySelector("[data-filter-status]");
            var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
            var controls = [input, type, year, category].filter(Boolean);
            if (!cards.length || !controls.length) {
                return;
            }

            function valueOf(control) {
                return control ? control.value.trim().toLowerCase() : "";
            }

            function apply() {
                var query = valueOf(input);
                var typeValue = valueOf(type);
                var yearValue = valueOf(year);
                var categoryValue = valueOf(category);
                var hasFilter = Boolean(query || typeValue || yearValue || categoryValue);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardType = (card.getAttribute("data-type") || "").toLowerCase();
                    var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                    var cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    if (categoryValue && cardCategory !== categoryValue) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (status) {
                    status.textContent = hasFilter ? "当前匹配 " + visible + " 部影片" : "";
                }
            }

            controls.forEach(function (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play]");
            var stream = player.getAttribute("data-stream");
            var hls = null;
            var attached = false;

            if (!video || !stream) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (_, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        }
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    });
                    return;
                }

                video.src = stream;
            }

            function play() {
                attach();
                player.classList.add("is-playing");
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }

            video.addEventListener("click", function () {
                if (!attached || video.paused) {
                    play();
                    return;
                }
                video.pause();
            });

            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }
}());
