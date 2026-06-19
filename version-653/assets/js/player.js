import { H as Hls } from './hls.js';

export function setupPlayer(streamUrl) {
    var frame = document.querySelector('[data-player-frame]');
    var video = document.querySelector('[data-video-player]');
    var overlay = document.querySelector('[data-play-overlay]');
    var playButton = document.querySelector('[data-control-play]');
    var muteButton = document.querySelector('[data-control-mute]');
    var fullscreenButton = document.querySelector('[data-control-fullscreen]');
    var message = document.querySelector('[data-player-message]');
    var hls = null;
    var ready = false;
    var started = false;

    if (!frame || !video || !overlay || !streamUrl) {
        return;
    }

    var setMessage = function (text) {
        if (message) {
            message.textContent = text;
            message.hidden = !text;
        }
    };

    var setPlayingState = function () {
        var playing = !video.paused && !video.ended;
        frame.classList.toggle('playing', playing);
        if (playButton) {
            playButton.textContent = playing ? '暂停' : '播放';
        }
    };

    var prepare = function () {
        if (ready) {
            return;
        }

        ready = true;

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setMessage('网络波动，正在重新连接');
                    hls.startLoad();
                    return;
                }

                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setMessage('播放中断，正在恢复');
                    hls.recoverMediaError();
                    return;
                }

                setMessage('播放暂时不可用，请稍后再试');
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        setMessage('播放暂时不可用，请稍后再试');
    };

    var start = function () {
        prepare();
        started = true;
        overlay.classList.add('is-hidden');
        setMessage('');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                overlay.classList.remove('is-hidden');
                setPlayingState();
            });
        }
    };

    var togglePlay = function () {
        if (!started || video.paused || video.ended) {
            start();
            return;
        }

        video.pause();
    };

    overlay.addEventListener('click', start);
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', setPlayingState);
    video.addEventListener('pause', setPlayingState);
    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
        setPlayingState();
    });

    if (playButton) {
        playButton.addEventListener('click', togglePlay);
    }

    if (muteButton) {
        muteButton.addEventListener('click', function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '音量' : '静音';
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                return;
            }

            frame.requestFullscreen();
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
