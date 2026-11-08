// Pulse Music Player Core Script
document.addEventListener('DOMContentLoaded', () => {
  // Built-in Sample Track Library (High quality royalty-free demo tracks)
  let playlist = [
    {
      id: 1,
      title: 'Neon Horizons',
      artist: 'Aether Soundwave',
      album: 'Synthwave Odyssey',
      duration: '3:45',
      cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      liked: false
    },
    {
      id: 2,
      title: 'Midnight Reverie',
      artist: 'Luna Eclipse',
      album: 'Chillhop Beats Vol. 2',
      duration: '4:12',
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      liked: true
    },
    {
      id: 3,
      title: 'Cyberpunk Drive',
      artist: 'HyperDrive',
      album: 'Sub-Zero Velocity',
      duration: '3:30',
      cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      liked: false
    },
    {
      id: 4,
      title: 'Electric Euphoria',
      artist: 'Nova Frequency',
      album: 'Prismatic Dreams',
      duration: '5:02',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      liked: false
    },
    {
      id: 5,
      title: 'Solar Flare',
      artist: 'Aura Bloom',
      album: 'Cosmic Dust',
      duration: '3:18',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      liked: true
    },
    {
      id: 6,
      title: 'Deep Space Drift',
      artist: 'Starlight Void',
      album: 'Infinite Void',
      duration: '4:40',
      cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&auto=format&fit=crop&q=80',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      liked: false
    }
  ];

  // State Management
  let currentTrackIndex = 0;
  let isPlaying = false;
  let isShuffle = false;
  let isRepeat = false;

  // DOM Elements
  const audio = document.getElementById('audio-engine');
  const masterPlayBtn = document.getElementById('master-play');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const repeatBtn = document.getElementById('repeat-btn');
  const progressBar = document.getElementById('progress-bar');
  const progressContainer = document.getElementById('progress-container');
  const currentTimeEl = document.getElementById('current-time');
  const durationTimeEl = document.getElementById('duration-time');
  const volumeRange = document.getElementById('volume-range');
  const muteBtn = document.getElementById('mute-btn');
  const trackListContainer = document.getElementById('track-list-container');
  const trackCountEl = document.getElementById('track-count');
  const searchInput = document.getElementById('search-input');
  const localUpload = document.getElementById('local-audio-upload');

  // Player Display Elements
  const playerCover = document.getElementById('player-cover');
  const playerTitle = document.getElementById('player-title');
  const playerArtist = document.getElementById('player-artist');
  const playerLikeBtn = document.getElementById('player-like-btn');
  const heroDisk = document.getElementById('hero-disk');
  const heroPlayBtn = document.getElementById('hero-play-btn');
  const waveVisualizer = document.getElementById('wave-visualizer');

  // Initialize
  function init() {
    renderTrackList(playlist);
    loadTrack(currentTrackIndex);
    setupEventListeners();
  }

  // Format Seconds to MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Render Track List
  function renderTrackList(tracks) {
    trackCountEl.textContent = `${tracks.length} Tracks`;
    trackListContainer.innerHTML = '';

    if (tracks.length === 0) {
      trackListContainer.innerHTML = `
        <div style="text-align:center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-music" style="font-size: 2rem; margin-bottom: 10px; display:block;"></i>
          No tracks matched your query.
        </div>`;
      return;
    }

    tracks.forEach((track, idx) => {
      const realIndex = playlist.findIndex(t => t.id === track.id);
      const isCurrent = realIndex === currentTrackIndex;

      const item = document.createElement('div');
      item.className = `track-item ${isCurrent ? 'active' : ''}`;
      item.innerHTML = `
        <span class="track-num">${isCurrent && isPlaying ? '<i class="fa-solid fa-volume-high" style="color:var(--accent-primary)"></i>' : idx + 1}</span>
        <img class="track-thumb" src="${track.cover}" alt="${track.title}">
        <div class="track-title-cell">
          <div class="track-meta-title">${track.title}</div>
          <div class="track-meta-artist">${track.artist}</div>
        </div>
        <div class="track-album">${track.album}</div>
        <div class="track-duration">${track.duration}</div>
        <button class="track-fav-btn ${track.liked ? 'liked' : ''}" data-id="${track.id}">
          <i class="${track.liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.track-fav-btn')) return;
        currentTrackIndex = realIndex;
        loadTrack(currentTrackIndex);
        playTrack();
      });

      trackListContainer.appendChild(item);
    });
  }

  // Load a track
  function loadTrack(index) {
    const track = playlist[index];
    if (!track) return;

    audio.src = track.src;
    playerCover.src = track.cover;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;

    if (playerLikeBtn) {
      playerLikeBtn.innerHTML = `<i class="${track.liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
      playerLikeBtn.classList.toggle('liked', track.liked);
    }

    // Update Hero card if playing track 0
    document.getElementById('hero-title').textContent = track.title;
    document.getElementById('hero-artist').textContent = `${track.artist} • ${track.album}`;
    document.getElementById('hero-cover').src = track.cover;

    updateActiveRow();
  }

  // Update active styling in playlist table
  function updateActiveRow() {
    const items = trackListContainer.querySelectorAll('.track-item');
    items.forEach((item, idx) => {
      const trackId = playlist[idx]?.id;
      const currentTrackId = playlist[currentTrackIndex]?.id;
      if (trackId === currentTrackId) {
        item.classList.add('active');
        const numSpan = item.querySelector('.track-num');
        if (numSpan) {
          numSpan.innerHTML = isPlaying ? '<i class="fa-solid fa-volume-high" style="color:var(--accent-primary)"></i>' : idx + 1;
        }
      } else {
        item.classList.remove('active');
        const numSpan = item.querySelector('.track-num');
        if (numSpan) numSpan.textContent = idx + 1;
      }
    });
  }

  // Play / Pause Logic
  function playTrack() {
    audio.play().then(() => {
      isPlaying = true;
      masterPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      heroPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
      heroDisk.classList.add('playing');
      waveVisualizer.classList.add('animating');
      updateActiveRow();
    }).catch(err => {
      console.warn("Audio autoplay blocked or format unsupported:", err);
    });
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    masterPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    heroPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play Now';
    heroDisk.classList.remove('playing');
    waveVisualizer.classList.remove('animating');
    updateActiveRow();
  }

  function togglePlay() {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  }

  // Next Track
  function nextTrack() {
    if (isShuffle) {
      currentTrackIndex = Math.floor(Math.random() * playlist.length);
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    loadTrack(currentTrackIndex);
    playTrack();
  }

  // Previous Track
  function prevTrack() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
  }

  // Set Timeline Progress
  function updateProgress() {
    const { currentTime, duration } = audio;
    if (duration) {
      const percent = (currentTime / duration) * 100;
      progressBar.style.width = `${percent}%`;
      currentTimeEl.textContent = formatTime(currentTime);
      durationTimeEl.textContent = formatTime(duration);
    }
  }

  function setProgress(e) {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (duration) {
      audio.currentTime = (clickX / width) * duration;
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Playback buttons
    masterPlayBtn.addEventListener('click', togglePlay);
    heroPlayBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    // Timeline
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
      if (isRepeat) {
        audio.currentTime = 0;
        playTrack();
      } else {
        nextTrack();
      }
    });
    progressContainer.addEventListener('click', setProgress);

    // Shuffle & Repeat toggles
    shuffleBtn.addEventListener('click', () => {
      isShuffle = !isShuffle;
      shuffleBtn.classList.toggle('active', isShuffle);
    });

    repeatBtn.addEventListener('click', () => {
      isRepeat = !isRepeat;
      repeatBtn.classList.toggle('active', isRepeat);
    });

    // Volume & Mute
    volumeRange.addEventListener('input', (e) => {
      audio.volume = e.target.value;
      if (audio.volume === 0) {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      } else {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      }
    });

    muteBtn.addEventListener('click', () => {
      if (audio.volume > 0) {
        audio.volume = 0;
        volumeRange.value = 0;
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      } else {
        audio.volume = 0.8;
        volumeRange.value = 0.8;
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      }
    });

    // Like button in player
    playerLikeBtn.addEventListener('click', () => {
      const track = playlist[currentTrackIndex];
      track.liked = !track.liked;
      playerLikeBtn.innerHTML = `<i class="${track.liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
      playerLikeBtn.classList.toggle('liked', track.liked);
      renderTrackList(playlist);
    });

    // Like click inside track list delegation
    trackListContainer.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.track-fav-btn');
      if (!favBtn) return;
      const trackId = parseInt(favBtn.dataset.id);
      const track = playlist.find(t => t.id === trackId);
      if (track) {
        track.liked = !track.liked;
        favBtn.classList.toggle('liked', track.liked);
        favBtn.innerHTML = `<i class="${track.liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
        if (playlist[currentTrackIndex].id === trackId) {
          playerLikeBtn.innerHTML = `<i class="${track.liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
          playerLikeBtn.classList.toggle('liked', track.liked);
        }
      }
    });

    // Search filter
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = playlist.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album.toLowerCase().includes(query)
      );
      renderTrackList(filtered);
    });

    // Local MP3 upload support
    localUpload.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const fileUrl = URL.createObjectURL(file);
        const newTrack = {
          id: Date.now() + Math.random(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Local Artist",
          album: "Local Storage",
          duration: "--:--",
          cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
          src: fileUrl,
          liked: false
        };
        playlist.unshift(newTrack);
      });
      currentTrackIndex = 0;
      renderTrackList(playlist);
      loadTrack(0);
      playTrack();
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
      } else if (e.code === 'ArrowLeft') {
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
      }
    });
  }

  init();
});
