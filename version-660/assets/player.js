(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    ready(function () {
        var video = document.querySelector('[data-player-video]');
        var cover = document.querySelector('[data-player-cover]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-play');
        var hlsInstance = null;
        var prepared = false;

        function prepare() {
            if (prepared) {
                return Promise.resolve();
            }
            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1600);
                });
            }

            video.src = source;
            return Promise.resolve();
        }

        function play() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            prepare().then(function () {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    });
}());
