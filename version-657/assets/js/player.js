function initMoviePlayer(videoUrl, playerId) {
  var video = document.getElementById(playerId);
  var cover = document.querySelector('[data-play-trigger]');
  var hlsInstance = null;
  var ready = false;

  function prepare() {
    if (!video || ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
    ready = true;
  }

  function play() {
    prepare();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
