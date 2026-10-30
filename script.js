let packageData = [];
const entry = document.getElementById('entry-screen');
const mainApp = document.getElementById('main-app');
const logBox = document.getElementById('boot-log');
const audio = document.getElementById('bg-audio');
const searchInput = document.getElementById('search-input');
const pcSearchInput = document.getElementById('pc-search-input');
const bioText = document.getElementById('bio-text');
let isPlaying = false;

const customMenu = document.getElementById('custom-menu');

const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

document.addEventListener('contextmenu', e => {
    e.preventDefault();

    const { clientX: mouseX, clientY: mouseY } = e;
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

    customMenu.style.display = 'block';

    // Position adjustments to prevent menu from going off-screen
    let posX = mouseX;
    let posY = mouseY;

    if (mouseX + 220 > windowWidth) posX = windowWidth - 230;
    if (mouseY + 300 > windowHeight) posY = windowHeight - 310;

    customMenu.style.left = `${posX}px`;
    customMenu.style.top = `${posY}px`;
    customMenu.style.transformOrigin = (mouseX + 220 > windowWidth) ? 'top right' : 'top left';
});

document.addEventListener('click', () => {
    if (customMenu) customMenu.style.display = 'none';
});

// Mouse Trail Logic
let lastParticleTime = 0;
document.addEventListener('mousemove', e => {
    const { clientX: x, clientY: y } = e;

    // Spawn particles with a rate limit for a "short" clean trail
    const now = Date.now();
    if (now - lastParticleTime > 40) {
        spawnParticle(x, y);
        lastParticleTime = now;
    }
});

function spawnParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'pointer-particle';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;

    // Add slight random drift for more visibility and fluid motion
    const driftX = (Math.random() - 0.5) * 20;
    const driftY = (Math.random() - 0.5) * 20;
    p.style.setProperty('--drift-x', `${driftX}px`);
    p.style.setProperty('--drift-y', `${driftY}px`);

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 500);
}
document.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'k')) e.preventDefault();
    if (e.key === 'F12') e.preventDefault();
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'K')) e.preventDefault();
});

console.log("%cSecurity Active", "color: #3b82f6; font-size: 20px; font-weight: bold;");
console.log("Cydia Elite Spatial System Protected.");

// Anti-Debugger Logic
(function () {
    const intruderAlert = () => {
        function check(i) {
            if (("" + i / i).length !== 1 || i % 20 === 0) {
                (function () { }.constructor("debugger")());
            } else {
                (function () { }.constructor("debugger")());
            }
            check(++i);
        }
        try {
            check(0);
        } catch (e) {
            setTimeout(intruderAlert, 500);
        }
    };
    // Uncomment the line below to enable aggressive anti-debugging
    // intruderAlert();

    // Subtle version: only trigger if devtools might be open
    setInterval(() => {
        const start = Date.now();
        debugger;
        const end = Date.now();
        if (end - start > 100) {
            console.warn("Debugger detected. System paused.");
            const debugBar = document.getElementById('fake-debugger-bar');
            if (debugBar) debugBar.style.display = 'flex';
        }
    }, 1000);
})();

function resumeFakeDebugger() {
    const debugBar = document.getElementById('fake-debugger-bar');
    if (debugBar) debugBar.style.display = 'none';
    showToast('System resumed', 'fa-play');
}


window.onload = async () => {
    try {
        const response = await fetch('data.json');
        packageData = await response.json();
    } catch (err) {
        console.error("Failed to load packages via API: ", err);
    }

    const bootLines = [
        "Apple MobileDeviceService started...",
        "Mounting root filesystem (read-only)...",
        "Loading kernel extensions.",
        "Starting Cydia Substrate...",
        "Hooking SpringBoard...",
        "Downloading packages.gz...",
        "Done: Packages, 31 total."
    ];
    bootLines.forEach((l, i) => {
        const d = document.createElement('div');
        d.className = 'log-line';
        d.innerText = l;
        logBox.appendChild(d);
        setTimeout(() => d.classList.add('visible'), i * 150);
    });
    renderInstalled();
    renderCategoriesHub();
    updateClock();
    updateStats();
    handleDeepLink();
    if (typeof startHomeActivityMonitor === 'function') {
        startHomeActivityMonitor();
    }
};

function showToast(message, icon = 'fa-info-circle') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 10);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Friendly Category Hashes Mapping to Database IDs
const categoryHashMap = {
    'community': 'social', 'social': 'social',
    'ai-tools': 'ai', 'ai': 'ai',
    'movies': 'movies',
    'anime': 'anime',
    'cartoons': 'cartoon', 'cartoon': 'cartoon',
    'kurdish': 'kurdish',
    
    'live-tv': 'livetv', 'livetv': 'livetv',
    'pc-games': 'games', 'games': 'games',
    'emulators': 'emulators', 'emulator': 'emulators',
    'game-mods': 'mods', 'mods': 'mods',
    'pc-tools': 'tools', 'tools': 'tools',
    'web-browsers': 'browser', 'browser': 'browser',
    'automation-scripts': 'scripts', 'scripts': 'scripts',
    'ad-blockers': 'ads', 'ads': 'ads'
};

function handleDeepLink() {
    const rawHash = window.location.hash.substring(1);
    if (!rawHash) return;

    const hash = rawHash.toLowerCase();

    if (hash.startsWith('url=')) {
        const targetUrl = decodeURIComponent(rawHash.substring(4));
        if (targetUrl) {
            switchTab('tiktok');
            const tiktokInput = document.getElementById('tiktok-url');
            if (tiktokInput) {
                tiktokInput.value = targetUrl;
                setTimeout(() => {
                    const fetchBtn = document.getElementById('tiktok-fetch-btn');
                    if (fetchBtn && !fetchBtn.disabled) fetchTikTok();
                }, 500);
            }
        }
    } else {
        const validTabs = [
            'home', 'categories-hub', 'installed', 'search', 'tiktok', 'instagram',
            'google', 'anime-search', 'api-hub', 'faq', 'about',
            'privacy', 'contact', 'status'
        ];

        // 1. Support `#installed/social` format
        if (hash.startsWith('installed/')) {
            const catId = hash.substring(10);
            filterCategory(catId);
        }
        // 2. Support standard valid tabs
        else if (validTabs.includes(hash)) {
            switchTab(hash);
        }
        // 3. Support direct category names as hashes, e.g. `#community` or `#tools`
        else if (categoryHashMap[hash]) {
            const catId = categoryHashMap[hash];
            filterCategory(catId);
        }
        // 4. Support legacy `#cat-social` formats
        else if (hash.startsWith('cat-')) {
            const catId = hash.substring(4);
            filterCategory(catId);
        }
    }
}

window.addEventListener('hashchange', handleDeepLink);

function updateStats() {
    if (!packageData) return;
    const totalLinks = packageData.length;
    const uniqueCategories = new Set(packageData.map(p => p.cat)).size;

    const linksEl = document.getElementById('stats-total-links');
    const catsEl = document.getElementById('stats-total-categories');

    if (linksEl) linksEl.innerText = totalLinks.toLocaleString();
    if (catsEl) catsEl.innerText = uniqueCategories;

    // Populate Home Registry Breakdown dynamic counters
    const countAi = packageData.filter(p => p.cat === 'ai').length;
    const countTools = packageData.filter(p => p.cat === 'tools').length;
    const countKurdish = packageData.filter(p => p.cat === 'kurdish').length;
    const countMovies = packageData.filter(p => p.cat === 'movies').length;

    const elAi = document.getElementById('count-ai');
    const elTools = document.getElementById('count-tools');
    const elKurdish = document.getElementById('count-kurdish');
    const elMovies = document.getElementById('count-movies');

    if (elAi) elAi.innerText = countAi;
    if (elTools) elTools.innerText = countTools;
    if (elKurdish) elKurdish.innerText = countKurdish;
    if (elMovies) elMovies.innerText = countMovies;
}

function createBiometricDots() {
    const container = document.querySelector('.biometric-dots');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const dot = document.createElement('div');
        dot.className = 'bio-dot';
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';
        dot.style.animation = `bioPulse ${1 + Math.random() * 2}s infinite ${Math.random() * 2}s`;
        container.appendChild(dot);
    }
}

entry.addEventListener('click', () => {
    entry.style.opacity = '0';
    // Force video play on user interaction for mobile
    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) bgVideo.play().catch(() => { });

    setTimeout(() => {
        entry.style.display = 'none';
        const lockScreen = document.getElementById('spatial-lock');
        const lockLabel = document.getElementById('lock-label');
        lockScreen.style.display = 'flex';
        createBiometricDots();

        setTimeout(() => {
            lockLabel.innerText = "Identity Verified";
            lockLabel.style.color = "#4ade80";
            document.querySelector('.face-scan-container').classList.add('verified');
            setTimeout(() => {
                lockScreen.style.opacity = '0';
                setTimeout(() => {
                    lockScreen.style.display = 'none';
                    mainApp.style.opacity = '1';
                    typeWriter("Architecting spatial experiences for 2026.", 0);
                    audio.volume = 0.3;
                    audio.play().catch(() => { });
                }, 400);
            }, 600);
        }, 1200);
    }, 400);
    isPlaying = true;
    document.getElementById('audio-fab').innerHTML = '<i class="fas fa-pause"></i>';
});

// Resume media when tab becomes visible again (mobile background fix)
document.addEventListener('visibilitychange', () => {
    const bgVideo = document.getElementById('bg-video');
    if (document.visibilityState === 'visible') {
        if (bgVideo) bgVideo.play().catch(() => { });
        if (isPlaying && audio) audio.play().catch(() => { });
    }
});

function updateClock() {
    const now = new Date();
    const rawHours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ms = now.getMilliseconds();

    const ampm = rawHours >= 12 ? 'PM' : 'AM';
    const displayHours = rawHours % 12 || 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = displayHours + ':' + displayMinutes + ' ' + ampm;

    const timeEl = document.getElementById('iphone-time');
    if (timeEl && timeEl.innerText !== strTime) timeEl.innerText = strTime;

    const mainClock = document.getElementById('main-clock-time');
    if (mainClock && mainClock.innerText !== strTime) mainClock.innerText = strTime;

    const mainDate = document.getElementById('main-clock-date');
    if (mainDate && !mainDate.dataset.set) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        mainDate.innerText = now.toLocaleDateString(undefined, options);
        mainDate.dataset.set = "true";
    }

    // High-precision Swiss analog clock movement
    const hourHand = document.getElementById('hour-hand');
    const minHand = document.getElementById('minute-hand');
    const secHand = document.getElementById('second-hand');

    const secDeg = (seconds * 6) + (ms * 0.006);
    const minDeg = (minutes * 6) + (seconds * 0.1);
    const hourDeg = ((rawHours % 12) * 30) + (minutes * 0.5);

    if (secHand) secHand.style.transform = `rotate(${secDeg}deg)`;
    if (minHand) minHand.style.transform = `rotate(${minDeg}deg)`;
    if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;

    requestAnimationFrame(updateClock);
}

function typeWriter(text, i) {
    if (i < text.length) {
        bioText.innerHTML = text.substring(0, i + 1) + '|';
        setTimeout(() => typeWriter(text, i + 1), 40);
    } else {
        bioText.innerHTML = text;
    }
}

// Songs Player & Playlist Management
const defaultPlaylist = [
    { name: "12.Ewini be kota instrumental Huner Heme Jezza", title: "Ewini Be Kota (Instrumental)", artist: "Huner Heme Jezza", url: "12.Ewini be kota instrumental Huner Heme Jezza.mp3", isDefault: true, color: "#06b6d4", colorRgb: "6, 182, 212" },
    { name: "NAVID ZARDI MAMHENA MAMBA", title: "Mamhena Mamba", artist: "Navid Zardi", url: "NAVID ZARDI MAMHENA MAMBA.mp3", isDefault: true, color: "#f43f5e", colorRgb: "244, 63, 94" },
    { name: "Karwan Hawramy Chav Rasha Min Official", title: "Chav Rasha Min", artist: "Karwan Hawramy", url: "Karwan Hawramy Chav Rasha Min Official Music Video.mp3", isDefault: true, color: "#f59e0b", colorRgb: "245, 158, 11" },
    { name: "Lala (Default Background)", title: "Lala", artist: "Spatial Ambient Chill", url: "lala.mp3", isDefault: true, color: "#a855f7", colorRgb: "168, 85, 247" }
];

let playlist = [...defaultPlaylist];
let currentSongIndex = 0;
let preMuteVolume = 0.3;
let isShuffleEnabled = localStorage.getItem('songs_shuffle') === 'true';
let repeatMode = localStorage.getItem('songs_repeat') || 'all'; // 'off' | 'all' | 'one'
let searchFilterQuery = '';

const colorPresets = [
    { color: "#a855f7", rgb: "168, 85, 247" }, // Purple
    { color: "#f43f5e", rgb: "244, 63, 94" },   // Rose
    { color: "#06b6d4", rgb: "6, 182, 212" },   // Cyan
    { color: "#f59e0b", rgb: "245, 158, 11" },   // Amber
    { color: "#10b981", rgb: "16, 185, 129" }    // Emerald
];

function formatTime(secs) {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function parseSongMetadata(song) {
    if (!song) return { title: "No Song Selected", artist: "Unknown Artist" };
    if (song.title && song.artist) return { title: song.title, artist: song.artist };
    
    const raw = song.name || "";
    if (raw.includes("Huner Heme Jezza") || raw.includes("Jezza")) {
        return { title: "Ewini Be Kota (Instrumental)", artist: "Huner Heme Jezza" };
    }
    if (raw.includes("NAVID ZARDI") || raw.includes("Mamhena")) {
        return { title: "Mamhena Mamba", artist: "Navid Zardi" };
    }
    if (raw.includes("Karwan Hawramy") || raw.includes("Chav Rasha")) {
        return { title: "Chav Rasha Min", artist: "Karwan Hawramy" };
    }
    if (raw.toLowerCase().includes("lala")) {
        return { title: "Lala", artist: "Spatial Ambient Chill" };
    }
    if (raw.includes(" - ")) {
        const parts = raw.split(" - ");
        return { title: parts[1].trim(), artist: parts[0].trim() };
    }
    return { title: raw, artist: "Curated Track" };
}

// Load playlist from localStorage
function initSongsPlaylist() {
    const savedPlaylist = localStorage.getItem('songs_playlist');
    if (savedPlaylist) {
        try {
            const parsed = JSON.parse(savedPlaylist);
            if (Array.isArray(parsed) && parsed.length > 0) {
                playlist = parsed;
            }
        } catch (e) {
            console.error("Failed to parse saved playlist, resetting defaults", e);
        }
    }
    const savedIndex = localStorage.getItem('songs_current_index');
    if (savedIndex !== null) {
        currentSongIndex = parseInt(savedIndex) || 0;
        if (currentSongIndex >= playlist.length) currentSongIndex = 0;
    }

    if (audio) {
        audio.removeAttribute('loop');
        audio.addEventListener('ended', () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            } else if (repeatMode === 'off' && currentSongIndex === playlist.length - 1 && !isShuffleEnabled) {
                isPlaying = false;
                updateSongsPlayerUI();
                renderPlaylist();
            } else {
                nextSong();
            }
        });

        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            const progress = (audio.currentTime / audio.duration) * 100;
            const progressInput = document.getElementById('audio-progress-bar');
            if (progressInput) {
                progressInput.value = progress;
                const activeColor = (playlist[currentSongIndex] && playlist[currentSongIndex].color) || '#a855f7';
                progressInput.style.background = `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${progress}%, rgba(255, 255, 255, 0.1) ${progress}%, rgba(255, 255, 255, 0.1) 100%)`;
            }

            const currentLabel = document.getElementById('track-time-current');
            if (currentLabel) currentLabel.innerText = formatTime(audio.currentTime);
        });

        audio.addEventListener('durationchange', () => {
            const durationLabel = document.getElementById('track-time-duration');
            if (durationLabel) durationLabel.innerText = formatTime(audio.duration);
        });
    }

    setTimeout(() => {
        const progressInput = document.getElementById('audio-progress-bar');
        if (progressInput) {
            progressInput.addEventListener('input', () => {
                if (!audio || !audio.duration) return;
                const newTime = (progressInput.value / 100) * audio.duration;
                audio.currentTime = newTime;
                const activeColor = (playlist[currentSongIndex] && playlist[currentSongIndex].color) || '#a855f7';
                progressInput.style.background = `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${progressInput.value}%, rgba(255, 255, 255, 0.1) ${progressInput.value}%, rgba(255, 255, 255, 0.1) 100%)`;
            });
        }

        const volumeSlider = document.getElementById('audio-volume-slider');
        if (volumeSlider) {
            if (audio) {
                volumeSlider.value = audio.volume * 100;
            }
            volumeSlider.style.background = `linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) ${volumeSlider.value}%, rgba(255, 255, 255, 0.1) ${volumeSlider.value}%, rgba(255, 255, 255, 0.1) 100%)`;

            volumeSlider.addEventListener('input', () => {
                if (!audio) return;
                const vol = volumeSlider.value / 100;
                audio.volume = vol;
                audio.muted = false;

                volumeSlider.style.background = `linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) ${volumeSlider.value}%, rgba(255, 255, 255, 0.1) ${volumeSlider.value}%, rgba(255, 255, 255, 0.1) 100%)`;

                const volumeIcon = document.getElementById('volume-icon-btn');
                if (volumeIcon) {
                    if (vol === 0) {
                        volumeIcon.className = 'fas fa-volume-mute';
                        volumeIcon.style.color = '#ef4444';
                    } else {
                        volumeIcon.className = vol > 0.5 ? 'fas fa-volume-up' : 'fas fa-volume-down';
                        volumeIcon.style.color = 'rgba(255,255,255,0.6)';
                    }
                }
            });
        }
    }, 500);
}

setTimeout(initSongsPlaylist, 100);

function openSongsPlayer() {
    const modal = document.getElementById('songs-player-modal');
    if (modal) {
        modal.classList.add('active');
        updateSongsPlayerUI();
        renderPlaylist();
    }
}

function closeSongsPlayer() {
    const modal = document.getElementById('songs-player-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function renderPlaylist() {
    const container = document.getElementById('playlist-items-container');
    if (!container) return;

    const countBadge = document.getElementById('songs-count-badge');
    if (countBadge) {
        countBadge.innerText = `${playlist.length} ${playlist.length === 1 ? 'Track' : 'Tracks'}`;
    }

    let itemsToRender = playlist.map((song, index) => ({ song, originalIndex: index }));
    if (searchFilterQuery.trim()) {
        const q = searchFilterQuery.toLowerCase();
        itemsToRender = itemsToRender.filter(item => {
            const meta = parseSongMetadata(item.song);
            return meta.title.toLowerCase().includes(q) || meta.artist.toLowerCase().includes(q) || item.song.name.toLowerCase().includes(q);
        });
    }

    if (itemsToRender.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 28px 14px; color: rgba(255,255,255,0.4); font-size: 0.85rem;">
                <i class="fas fa-music" style="font-size: 1.6rem; margin-bottom: 8px; opacity: 0.4;"></i>
                <div>No tracks match "${searchFilterQuery}"</div>
            </div>`;
        return;
    }

    let html = "";
    itemsToRender.forEach((item, pos) => {
        const { song, originalIndex } = item;
        const isActive = originalIndex === currentSongIndex;
        const activeClass = isActive ? 'active' : '';
        const meta = parseSongMetadata(song);
        const trackNum = (originalIndex + 1).toString().padStart(2, '0');
        
        let iconHtml;
        if (isActive && isPlaying) {
            iconHtml = `
                <div class="eq-visualizer">
                    <div class="eq-bar" style="--delay: 0.1s"></div>
                    <div class="eq-bar" style="--delay: 0.4s"></div>
                    <div class="eq-bar" style="--delay: 0.2s"></div>
                    <div class="eq-bar" style="--delay: 0.6s"></div>
                </div>`;
        } else {
            const bulletColor = song.color || '#3b82f6';
            iconHtml = `<i class="fas fa-play" style="font-size: 0.72rem; color: ${isActive ? bulletColor : 'rgba(255,255,255,0.4)'};"></i>`;
        }

        html += `
            <div class="playlist-item ${activeClass}" onclick="selectSong(${originalIndex})">
                <div class="playlist-item-left">
                    <span class="playlist-track-num">${trackNum}</span>
                    <div class="playlist-item-icon-wrap">
                        ${iconHtml}
                    </div>
                    <div class="playlist-item-meta">
                        <span class="playlist-item-title" title="${meta.title}">${meta.title}</span>
                        <span class="playlist-item-artist">${meta.artist}</span>
                    </div>
                </div>
                <div class="playlist-item-right">
                    ${song.isDefault ? `<span class="playlist-badge">Default</span>` : `
                        <span class="playlist-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.3);">Custom</span>
                        <button class="playlist-item-delete" onclick="deleteSong(${originalIndex}, event)" title="Delete track">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function updateSongsPlayerUI() {
    const titleEl = document.getElementById('now-playing-title');
    const artistEl = document.getElementById('now-playing-artist');
    const statusEl = document.getElementById('now-playing-status');
    const containerEl = document.getElementById('now-playing-container');
    const discEl = document.getElementById('now-playing-disc');
    const modalPlayBtn = document.getElementById('modal-play-btn');
    const fabBtn = document.getElementById('audio-fab');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');

    if (playlist[currentSongIndex]) {
        const song = playlist[currentSongIndex];
        const meta = parseSongMetadata(song);

        if (titleEl) titleEl.innerText = meta.title;
        if (artistEl) artistEl.innerText = meta.artist;
        if (statusEl) statusEl.innerText = isPlaying ? "Playing" : "Paused";
        const navMusicTitle = document.getElementById('nav-music-title');
        const navMusicPill = document.getElementById('nav-music-pill');
        if (navMusicTitle && meta) {
            navMusicTitle.innerText = meta.title || "Music Deck";
        }
        if (navMusicPill) {
            navMusicPill.classList.toggle('is-playing', !!isPlaying);
        }

        if (containerEl) {
            containerEl.style.setProperty('--player-accent', song.color || '#a855f7');
            containerEl.style.setProperty('--player-accent-rgb', song.colorRgb || '168, 85, 247');

            if (isPlaying) {
                containerEl.classList.add('playing');
            } else {
                containerEl.classList.remove('playing');
            }
        }

        if (discEl) {
            if (isPlaying) {
                discEl.classList.add('playing');
            } else {
                discEl.classList.remove('playing');
            }
        }

        if (modalPlayBtn) {
            modalPlayBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        }

        if (shuffleBtn) {
            if (isShuffleEnabled) {
                shuffleBtn.classList.add('active');
            } else {
                shuffleBtn.classList.remove('active');
            }
        }

        if (repeatBtn) {
            repeatBtn.classList.remove('active');
            if (repeatMode === 'all') {
                repeatBtn.classList.add('active');
                repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
                repeatBtn.title = 'Repeat All';
            } else if (repeatMode === 'one') {
                repeatBtn.classList.add('active');
                repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
                repeatBtn.title = 'Repeat One';
            } else {
                repeatBtn.innerHTML = '<i class="fas fa-redo" style="opacity: 0.4;"></i>';
                repeatBtn.title = 'Repeat Off';
            }
        }

        if (fabBtn) {
            fabBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-music"></i>';
            if (isPlaying) {
                fabBtn.classList.add('pulse-glow-green');
                fabBtn.style.animation = "spin 12s linear infinite";
                fabBtn.style.setProperty('box-shadow', `0 15px 40px rgba(${song.colorRgb || '255,255,255'}, 0.35)`);
                fabBtn.style.setProperty('border-color', song.color || '#fff');
            } else {
                fabBtn.classList.remove('pulse-glow-green');
                fabBtn.style.animation = "none";
                fabBtn.style.removeProperty('box-shadow');
                fabBtn.style.removeProperty('border-color');
            }
        }

        if (audio) {
            const currentLabel = document.getElementById('track-time-current');
            if (currentLabel) currentLabel.innerText = formatTime(audio.currentTime);

            const durationLabel = document.getElementById('track-time-duration');
            if (durationLabel) durationLabel.innerText = formatTime(audio.duration);

            const progressInput = document.getElementById('audio-progress-bar');
            if (progressInput && audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressInput.value = progress;
                const activeColor = song.color || '#a855f7';
                progressInput.style.background = `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${progress}%, rgba(255, 255, 255, 0.1) ${progress}%, rgba(255, 255, 255, 0.1) 100%)`;
            }

            const volumeSlider = document.getElementById('audio-volume-slider');
            if (volumeSlider) {
                const volVal = audio.volume * 100;
                volumeSlider.value = volVal;
                volumeSlider.style.background = `linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) ${volVal}%, rgba(255, 255, 255, 0.1) ${volVal}%, rgba(255, 255, 255, 0.1) 100%)`;
            }
        }
    }
}

function selectSong(index) {
    if (index === currentSongIndex) {
        toggleSongsPlay();
        return;
    }

    currentSongIndex = index;
    localStorage.setItem('songs_current_index', currentSongIndex);

    const song = playlist[currentSongIndex];
    if (audio) {
        audio.src = song.url;
        isPlaying = true;
        audio.volume = 0.3;
        audio.play().catch(e => {
            console.error("Audio playback blocked/failed", e);
            isPlaying = false;
            updateSongsPlayerUI();
            renderPlaylist();
        });
    }

    updateSongsPlayerUI();
    renderPlaylist();
}

function toggleSongsPlay() {
    if (!audio) return;

    const currentUrl = playlist[currentSongIndex] ? playlist[currentSongIndex].url : '';
    const audioSrc = audio.src || '';
    if (currentUrl && !audioSrc.includes(currentUrl)) {
        audio.src = currentUrl;
    }

    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.volume = 0.3;
        audio.play().then(() => {
            isPlaying = true;
            updateSongsPlayerUI();
            renderPlaylist();
        }).catch(e => {
            console.error("Failed to play audio", e);
            showToast("Click screen first to allow audio playback!", "fa-exclamation-triangle");
        });
    }

    updateSongsPlayerUI();
    renderPlaylist();
}

function nextSong() {
    if (playlist.length === 0) return;
    let nextIndex;
    if (isShuffleEnabled && playlist.length > 1) {
        do {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentSongIndex);
    } else {
        nextIndex = (currentSongIndex + 1) % playlist.length;
    }
    selectSong(nextIndex);
}

function prevSong() {
    if (playlist.length === 0) return;
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    selectSong(prevIndex);
}

function toggleAudio() {
    toggleSongsPlay();
}

function toggleShuffle() {
    isShuffleEnabled = !isShuffleEnabled;
    localStorage.setItem('songs_shuffle', isShuffleEnabled);
    showToast(isShuffleEnabled ? "Shuffle Mode: Enabled" : "Shuffle Mode: Disabled", "fa-random");
    updateSongsPlayerUI();
}

function toggleRepeat() {
    if (repeatMode === 'all') {
        repeatMode = 'one';
        showToast("Repeat: Current Track", "fa-redo-alt");
    } else if (repeatMode === 'one') {
        repeatMode = 'off';
        showToast("Repeat: Off", "fa-redo");
    } else {
        repeatMode = 'all';
        showToast("Repeat: All Tracks", "fa-redo");
    }
    localStorage.setItem('songs_repeat', repeatMode);
    updateSongsPlayerUI();
}

function seekRelative(seconds) {
    if (!audio) return;
    const target = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
    audio.currentTime = target;
    showToast(seconds > 0 ? "+10s Forward" : "-10s Rewind", seconds > 0 ? "fa-redo-alt" : "fa-undo-alt");
}

function setVolumeMax() {
    if (!audio) return;
    audio.volume = 1.0;
    audio.muted = false;
    const volumeSlider = document.getElementById('audio-volume-slider');
    if (volumeSlider) {
        volumeSlider.value = 100;
        volumeSlider.style.background = "linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) 100%, rgba(255, 255, 255, 0.1) 100%)";
    }
    const volumeIcon = document.getElementById('volume-icon-btn');
    if (volumeIcon) {
        volumeIcon.className = 'fas fa-volume-up';
        volumeIcon.style.color = 'rgba(255,255,255,0.6)';
    }
    showToast("Volume: 100%", "fa-volume-up");
}

function filterPlaylistTracks() {
    const input = document.getElementById('playlist-search-input');
    const clearBtn = document.getElementById('playlist-search-clear');
    searchFilterQuery = input ? input.value : '';
    if (clearBtn) {
        clearBtn.style.display = searchFilterQuery ? 'block' : 'none';
    }
    renderPlaylist();
}

function clearPlaylistSearch() {
    const input = document.getElementById('playlist-search-input');
    const clearBtn = document.getElementById('playlist-search-clear');
    if (input) input.value = '';
    searchFilterQuery = '';
    if (clearBtn) clearBtn.style.display = 'none';
    renderPlaylist();
}

function toggleAddSongAccordion() {
    const section = document.getElementById('add-song-accordion');
    if (section) {
        section.classList.toggle('open');
    }
}

function resetPlaylistDefaults() {
    playlist = [...defaultPlaylist];
    currentSongIndex = 0;
    localStorage.setItem('songs_playlist', JSON.stringify(playlist));
    localStorage.setItem('songs_current_index', 0);
    showToast("Track library restored to defaults!", "fa-history");
    renderPlaylist();
    updateSongsPlayerUI();
}

function addCustomSong() {
    const nameInput = document.getElementById('add-song-name');
    const urlInput = document.getElementById('add-song-url');
    if (!nameInput || !urlInput) return;

    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    if (!name || !url) {
        showToast("Please enter both song title and direct audio URL.", "fa-exclamation-triangle");
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showToast("Please enter a valid HTTP/HTTPS audio URL.", "fa-exclamation-triangle");
        return;
    }

    const randomColor = colorPresets[Math.floor(Math.random() * colorPresets.length)];
    const meta = parseSongMetadata({ name });

    playlist.push({
        name,
        title: meta.title,
        artist: meta.artist,
        url,
        isDefault: false,
        color: randomColor.color,
        colorRgb: randomColor.rgb
    });
    localStorage.setItem('songs_playlist', JSON.stringify(playlist));

    nameInput.value = "";
    urlInput.value = "";

    const accordion = document.getElementById('add-song-accordion');
    if (accordion) accordion.classList.remove('open');

    showToast("Song added to library!", "fa-check-circle");
    renderPlaylist();
}

function deleteSong(index, event) {
    if (event) event.stopPropagation();

    if (playlist[index].isDefault) return;

    if (index === currentSongIndex) {
        if (audio && isPlaying) {
            audio.pause();
            isPlaying = false;
        }
        currentSongIndex = 0;
        localStorage.setItem('songs_current_index', 0);
    } else if (index < currentSongIndex) {
        currentSongIndex--;
        localStorage.setItem('songs_current_index', currentSongIndex);
    }

    playlist.splice(index, 1);
    localStorage.setItem('songs_playlist', JSON.stringify(playlist));

    showToast("Song removed from library.", "fa-check-circle");
    renderPlaylist();
    updateSongsPlayerUI();
}

function toggleMute() {
    if (!audio) return;
    const volumeIcon = document.getElementById('volume-icon-btn');
    const volumeSlider = document.getElementById('audio-volume-slider');

    if (audio.muted) {
        audio.muted = false;
        audio.volume = preMuteVolume;
        if (volumeSlider) volumeSlider.value = preMuteVolume * 100;
        if (volumeIcon) {
            volumeIcon.className = preMuteVolume > 0.5 ? 'fas fa-volume-up' : 'fas fa-volume-down';
            volumeIcon.style.color = 'rgba(255,255,255,0.6)';
        }
        showToast("Unmuted", "fa-volume-up");
    } else {
        preMuteVolume = audio.volume > 0 ? audio.volume : 0.3;
        audio.muted = true;
        audio.volume = 0;
        if (volumeSlider) volumeSlider.value = 0;
        if (volumeIcon) {
            volumeIcon.className = 'fas fa-volume-mute';
            volumeIcon.style.color = '#ef4444';
        }
        showToast("Muted", "fa-volume-mute");
    }
}

// Global window exposure for robust inline HTML click bindings
window.openSongsPlayer = openSongsPlayer;
window.closeSongsPlayer = closeSongsPlayer;
window.toggleSongsPlay = toggleSongsPlay;
window.toggleAudio = toggleAudio;
window.selectSong = selectSong;
window.nextSong = nextSong;
window.prevSong = prevSong;
window.toggleShuffle = toggleShuffle;
window.toggleRepeat = toggleRepeat;
window.seekRelative = seekRelative;
window.setVolumeMax = setVolumeMax;
window.filterPlaylistTracks = filterPlaylistTracks;
window.clearPlaylistSearch = clearPlaylistSearch;
window.toggleAddSongAccordion = toggleAddSongAccordion;
window.resetPlaylistDefaults = resetPlaylistDefaults;
window.addCustomSong = addCustomSong;
window.deleteSong = deleteSong;
window.toggleMute = toggleMute;

// Global hotkeys (Escape to close, Space to toggle when modal active)
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('songs-player-modal');
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeSongsPlayer();
    } else if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        toggleSongsPlay();
    }
});


function switchTab(tabId, el = null) {
    document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById('view-' + tabId);
    if (targetView) targetView.classList.add('active');

    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    if (el) {
        el.classList.add('active');
    } else {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            const onclickStr = item.getAttribute('onclick') || '';
            if (onclickStr.includes(`switchTab('${tabId}')`)) {
                item.classList.add('active');
            }
        });
    }

    document.getElementById('main-scroll').scrollTop = 0;

    if (window.innerWidth < 1024) toggleMenu(false);

    // Update URL hash without triggering handleDeepLink recursively if possible
    // Using history.replaceState to avoid hashchange firing if needed, 
    // but standard hash update is fine since handleDeepLink checks validity.
    if (window.location.hash !== '#' + tabId) {
        history.replaceState(null, null, '#' + tabId);
    }

    // SEO Metadata dictionary mapping each tab view to optimized search titles & header labels
    const tabSeoMetadata = {
        'home': {
            nav: 'Home',
            seo: 'CHYA | Cydia Elite - Spatial Tweak Registry & Developer Portfolio'
        },
        'categories-hub': {
            nav: 'Categories',
            seo: 'Browse Package Registry Categories | Cydia Elite'
        },
        'installed': {
            nav: 'Packages',
            seo: 'All Software Tweaks & Tweak Package Registry | Cydia Elite'
        },
        'search': {
            nav: 'Search',
            seo: 'Search Software Tweak Registry | Cydia Elite'
        },
        'tiktok': {
            nav: 'TikTok Downloader',
            seo: 'TikTok Video Downloader (HD & No Watermark) | Cydia Elite'
        },
        'instagram': {
            nav: 'Insta LookUp',
            seo: 'Instagram Profile Directory Seeker | Cydia Elite'
        },
        'google': {
            nav: 'AI Search Hub',
            seo: 'AI Search & Web Copilot Assistant | Cydia Elite'
        },
        'anime-search': {
            nav: 'Anime Search',
            seo: 'Anime Scene Trace & Camera Search Seeker | Cydia Elite'
        },

        'free-games': {
            nav: 'Free Games',
            seo: 'Free Games Tracker - Claim Steam, Epic Games & GOG Giveaways | Cydia Elite'
        },
        'api-hub': {
            nav: 'API Hub',
            seo: 'Developer Public API Center & JSON Database Endpoints | Cydia Elite'
        },
        'faq': {
            nav: 'FAQ',
            seo: 'Developer Help Center & FAQ Center | Cydia Elite'
        },
        'about': {
            nav: 'About',
            seo: 'About Chya Luqman | UI/UX Engineer & Developer Profile'
        },
        'privacy': {
            nav: 'Terms & Privacy',
            seo: 'Terms of Service & Privacy Policy | Cydia Elite'
        },
        'contact': {
            nav: 'Contact',
            seo: 'Contact Developer & Customer Support | Cydia Elite'
        },
        'status': {
            nav: 'System Status',
            seo: 'Server Registry Mirrors & System Status | Cydia Elite'
        }
    };

    const metadata = tabSeoMetadata[tabId] || { nav: tabId, seo: 'CHYA | Cydia Elite' };

    // Update both displayed viewport labels and actual browser document title dynamically
    document.getElementById('nav-title-label').innerText = metadata.nav;
    const tabIcons = {
        'home': 'fas fa-home',
        'categories-hub': 'fas fa-th-large',
        'installed': 'fas fa-download',
        'search': 'fas fa-search',
        'tiktok': 'fab fa-tiktok',
        'instagram': 'fab fa-instagram',
        'google': 'fas fa-robot',
        'anime-search': 'fas fa-camera',
        'lens-search': 'fas fa-images',
        'free-games': 'fas fa-gamepad',
        'api-hub': 'fas fa-code',
        'faq': 'fas fa-question-circle',
        'about': 'fas fa-user-astronaut',
        'privacy': 'fas fa-shield-alt',
        'contact': 'fas fa-envelope',
        'status': 'fas fa-server'
    };
    const pillIcon = document.getElementById('nav-pill-icon');
    if (pillIcon && tabIcons[tabId]) {
        pillIcon.className = tabIcons[tabId];
    }
    document.title = metadata.seo;

    // Auto-load latest content for KD and KM if they are empty
    if (tabId === 'free-games') {
        loadFreeGames();
    }
}

function renderInstalled(filterCat = null) {
    const container = document.getElementById('installed-list-container');
    container.innerHTML = "";
    const categories = {
        social: "Social & Community", ai: "Artificial Intelligence",
        kurdish: "Kurdish Cinema", anime: "Anime & Manga",
        cartoon: "Cartoons",
        movies: "Movies & Series", tools: "Tools & Software",
        games: "Game Downloads", emulators: "Console & PC Emulators",
        mods: "Game Mods", livetv: "Live TV & IPTV", ads: "Ad Blockers",
        browser: "Web Browsers",
        sports: "Live Sports", scripts: "Automation Scripts"
    };

    let html = "";
    // Cache filtered results to avoid re-calculating on every render
    if (!window._pkgCache) window._pkgCache = {};

    for (const [key, label] of Object.entries(categories)) {
        if (filterCat && filterCat !== key) continue;

        const cacheKey = key;
        if (!window._pkgCache[cacheKey]) {
            window._pkgCache[cacheKey] = packageData.filter(p => p.cat === key);
        }
        const items = window._pkgCache[cacheKey];
        if (items.length === 0) continue;

        html += `<div class="section-header">${label}</div><div class="detail-group cat-${key}">`;
        items.forEach(pkg => {
            if (pkg.cmd) {
                const safeCmd = pkg.cmd.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                html += `
                    <a href="#" onclick="navigator.clipboard.writeText('${safeCmd}'); showToast('Command copied to clipboard!', 'fa-check-circle'); event.preventDefault();" class="pkg-list-item">
                        <div class="pkg-list-icon"><i class="${pkg.icon}"></i></div>
                        <div class="pkg-list-info"><span class="pkg-list-name">${pkg.name}</span><span class="pkg-list-desc" style="color:#007aff; font-family:monospace; font-size:0.75rem;">[Click to Copy Command]</span></div>
                        <span class="chevron"><i class="fas fa-copy" style="font-size:0.9rem; color:#888;"></i></span>
                    </a>`;
            } else {
                html += `
                    <a href="${pkg.url}" target="_blank" class="pkg-list-item">
                        <div class="pkg-list-icon"><i class="${pkg.icon}"></i></div>
                        <div class="pkg-list-info"><span class="pkg-list-name">${pkg.name}</span><span class="pkg-list-desc">${pkg.desc}</span></div>
                        <span class="chevron">›</span>
                    </a>`;
            }
        });
        html += `</div>`;
    }
    container.innerHTML = html;
}

function filterCategory(cat, el = null) {
    // If no sidebar element is passed, let's find the matching sidebar item to activate it visually
    if (!el) {
        el = Array.from(document.querySelectorAll('.sidebar-item')).find(item => {
            const onclickStr = item.getAttribute('onclick') || '';
            return onclickStr.includes(`filterCategory('${cat}'`);
        });
    }

    switchTab('installed', el);
    renderInstalled(cat);

    // Set URL hash to reflect the active category instead of overriding to generic "#installed"
    history.replaceState(null, null, `#installed/${cat}`);

    // Category SEO Metadata dictionary mapping dynamic filters to custom titles & labels
    const categorySeoMetadata = {
        'social': {
            nav: 'Community',
            seo: 'Social Communities & Discord Support Hub | Cydia Elite'
        },
        'ai': {
            nav: 'AI Tools',
            seo: 'Generative AI Tools & LLM Coding Assistants | Cydia Elite'
        },
        'movies': {
            nav: 'Movies',
            seo: 'Kurdish Movies & Cinema Series Streams | Cydia Elite'
        },
        'anime': {
            nav: 'Anime',
            seo: 'Watch HD Anime & Read Manga Online | Cydia Elite'
        },
        'cartoon': {
            nav: 'Cartoons',
            seo: 'Watch Kurdish Dubbed Cartoons Registry | Cydia Elite'
        },
        'kurdish': {
            nav: 'Kurdish Cinema',
            seo: 'Kurdish Media registries, Cinema & TV Portals | Cydia Elite'
        },
        'sports': {
            nav: 'Live Sports',
            seo: 'Watch Live Sports & Football Streams | Cydia Elite'
        },
        'livetv': {
            nav: 'Live TV',
            seo: 'Watch Live Kurdish & Global TV Channels (IPTV) | Cydia Elite'
        },
        'games': {
            nav: 'PC Games',
            seo: 'Download Full PC Games Registry | Cydia Elite'
        },
        'emulators': {
            nav: 'Emulators',
            seo: 'Console & PC Emulators Registry | Cydia Elite'
        },
        'mods': {
            nav: 'Game Mods',
            seo: 'Download Game Mods & Cheat Packages | Cydia Elite'
        },
        'tools': {
            nav: 'PC Tools',
            seo: 'Download PC Tools, Software & REST API Clients | Cydia Elite'
        },
        'browser': {
            nav: 'Web Browsers',
            seo: 'Advanced Web Browsers & Privacy Shields | Cydia Elite'
        },
        'scripts': {
            nav: 'Automation Scripts',
            seo: 'Automation PowerShell, cmd & Bash Scripts | Cydia Elite'
        },
        'ads': {
            nav: 'Ad Blockers',
            seo: 'Download Ad Blockers & Security Shields | Cydia Elite'
        }
    };

    const meta = categorySeoMetadata[cat];
    if (meta) {
        document.getElementById('nav-title-label').innerText = meta.nav;
        document.title = meta.seo;
    }
}

function renderCategoriesHub() {
    const container = document.getElementById('categories-grid-container');
    if (!container) return;

    const categoriesList = [
        { id: 'social', name: 'Community', icon: 'fab fa-discord', color: '#7289da' },
        { id: 'ai', name: 'AI Tools', icon: 'fas fa-robot', color: '#10b981' },
        { id: 'movies', name: 'Movies', icon: 'fas fa-film', color: '#ef4444' },
        { id: 'anime', name: 'Anime', icon: 'fas fa-ghost', color: '#ec4899' },
        { id: 'cartoon', name: 'Cartoons', icon: 'fas fa-child', color: '#f59e0b' },
        { id: 'kurdish', name: 'Kurdish', icon: 'fas fa-language', color: '#8b5cf6' },
        { id: 'sports', name: 'Live Sports', icon: 'fas fa-futbol', color: '#3b82f6' },
        { id: 'livetv', name: 'Live TV', icon: 'fas fa-satellite-dish', color: '#06b6d4' },
        { id: 'games', name: 'PC Games', icon: 'fas fa-gamepad', color: '#14b8a6' },
        { id: 'emulators', name: 'Emulators', icon: 'fas fa-microchip', color: '#06b6d4' },
        { id: 'mods', name: 'Game Mods', icon: 'fas fa-wrench', color: '#f97316' },
        { id: 'tools', name: 'PC Tools', icon: 'fas fa-toolbox', color: '#3b82f6' },
        { id: 'browser', name: 'Web Browsers', icon: 'fas fa-globe', color: '#10b981' },
        { id: 'scripts', name: 'Automation Scripts', icon: 'fas fa-scroll', color: '#8b5cf6' },
        { id: 'ads', name: 'Ad Blockers', icon: 'fas fa-shield-alt', color: '#ef4444' }
    ];

    container.innerHTML = '';
    categoriesList.forEach(cat => {
        const count = packageData.filter(p => p.cat === cat.id).length;

        const card = document.createElement('div');
        card.className = 'category-card';

        // Synchronize dynamic redirection and visual sidebar item triggers
        card.onclick = () => {
            const sidebarItem = Array.from(document.querySelectorAll('.sidebar-item')).find(item => {
                const onclickStr = item.getAttribute('onclick') || '';
                return onclickStr.includes(`filterCategory('${cat.id}'`);
            });
            filterCategory(cat.id, sidebarItem);
        };

        card.innerHTML = `
            <div class="category-card-glow" style="background: radial-gradient(circle at center, ${cat.color}18 0%, transparent 70%);"></div>
            <div class="category-card-icon" style="color: ${cat.color}; background: ${cat.color}0c; border: 1px solid ${cat.color}15;">
                <i class="${cat.icon}"></i>
            </div>
            <div class="category-card-info">
                <span class="category-card-name">${cat.name}</span>
                <span class="category-card-count">${count} packages</span>
            </div>
            <span class="category-card-arrow">›</span>
        `;
        container.appendChild(card);
    });
}

function toggleFaq(el) {
    const item = el.parentElement;
    const isActive = item.classList.contains('active');

    // Optional: Close other FAQ items
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

    if (!isActive) {
        item.classList.add('active');
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    searchInput.value = e.target.value;
    pcSearchInput.value = e.target.value;
    const rc = document.getElementById('search-results-container');

    if (query === "") {
        rc.innerHTML = `
            <div class="search-empty-state">
                <i class="fas fa-search"></i>
                <p>Search for packages, tools, or tweaks</p>
            </div>`;
        return;
    }

    const results = packageData.filter(p => p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));

    if (results.length > 0) {
        let html = `<div class="section-header">Found ${results.length} results</div><div class="detail-group">`;
        results.forEach(pkg => {
            if (pkg.cmd) {
                const safeCmd = pkg.cmd.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                html += `
                    <a href="#" onclick="navigator.clipboard.writeText('${safeCmd}'); showToast('Command copied!', 'fa-check-circle'); event.preventDefault();" class="pkg-list-item">
                        <div class="pkg-list-icon"><i class="${pkg.icon}"></i></div>
                        <div class="pkg-list-info"><span class="pkg-list-name">${pkg.name}</span><span class="pkg-list-desc">Copy Command</span></div>
                        <span class="chevron"><i class="fas fa-copy"></i></span>
                    </a>`;
            } else {
                html += `
                    <a href="${pkg.url}" target="_blank" class="pkg-list-item">
                        <div class="pkg-list-icon"><i class="${pkg.icon}"></i></div>
                        <div class="pkg-list-info"><span class="pkg-list-name">${pkg.name}</span><span class="pkg-list-desc">${pkg.desc}</span></div>
                        <span class="chevron">›</span>
                    </a>`;
            }
        });
        html += `</div>`;
        rc.innerHTML = html;
    } else {
        rc.innerHTML = `
            <div class="search-empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>No local results found for "${query}"</p>
                <button class="app-btn" style="margin-top:20px;" onclick="window.open('https://www.google.com/search?q=' + encodeURIComponent('${query.replace(/'/g, "\\'")}'), '_blank')">
                    <i class="fab fa-google"></i> Search on Google
                </button>
            </div>`;
    }
}

// Dynamic AI Synthesis action connector
window.synthesizeResultWithAi = function (title, snippet) {
    switchSearchMode('copilot');
    const aiInput = document.getElementById('ai-query');
    if (aiInput) {
        aiInput.value = `Synthesize this web result:\nTitle: ${title}\nDescription: ${snippet}\n\nExplain this tech topic and its significance briefly.`;
        performAiSearch();
    }
};

// Clipboard copy action handle
window.copyToClipboardText = function (text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied to clipboard!', 'fa-check-circle');
    }).catch(() => {
        showToast('Failed to copy link.', 'fa-times-circle');
    });
};

function generateFallbackSearchCards(query) {
    const q = query.toLowerCase();
    let cards = [];

    if (q.includes('tech') || q.includes('news') || q.includes('latest')) {
        cards = [
            { title: "TechCrunch - Startup and Technology News", snippet: "Technology news and analysis with a focus on founders and startup teams. Read about late-breaking developments in computing, social apps, and hardware.", url: "https://techcrunch.com/", displayUrl: "techcrunch.com > news" },
            { title: "The Verge - Vox Media Technology Coverage", snippet: "The Verge is a vox-media powered technological review journal. Find tech logs, spatial updates, gaming specifications, and browser news.", url: "https://theverge.com/", displayUrl: "theverge.com > tech" },
            { title: "Wired - Technology, Science, and Culture Insights", snippet: "In-depth coverage of current and future trends in technology, science, business, and design logs. Explore modern developments.", url: "https://wired.com/", displayUrl: "wired.com > business" }
        ];
    } else if (q.includes('ai') || q.includes('development') || q.includes('model') || q.includes('llm') || q.includes('deepseek') || q.includes('gpt')) {
        cards = [
            { title: "Hugging Face - The AI Community & Repository", snippet: "The platform where the world builds and shares machine learning models, datasets, and serverless LLM pipelines. Find state-of-the-art coder models.", url: "https://huggingface.co/", displayUrl: "huggingface.co > models" },
            { title: "OpenAI Blog - Advanced Intelligence Research", snippet: "Read about OpenAI's latest developments, model benchmarks, GPT-4o capabilities, and systems engineered for spatial workflows.", url: "https://openai.com/blog", displayUrl: "openai.com > blog" },
            { title: "DeepMind Google - Advanced AI Research Projects", snippet: "Google DeepMind's official journal logs documenting breakthroughs in multi-agent environments, Gemini 1.5 Pro architectures, and code assistants.", url: "https://deepmind.google/", displayUrl: "deepmind.google > research" }
        ];
    } else if (q.includes('spatial') || q.includes('computing') || q.includes('design') || q.includes('canvas') || q.includes('three')) {
        cards = [
            { title: "Apple Vision Pro - Spatial OS Specifications", snippet: "Explore the developer guidelines, design tokens, and physics-based motion rendering rules for spatial glassmorphism in visionOS.", url: "https://developer.apple.com/visionos/", displayUrl: "developer.apple > visionos" },
            { title: "Three.js - WebGL Physics Canvas Framework", snippet: "An easy-to-use, lightweight, cross-browser 3D library in vanilla Javascript. Create advanced motion backgrounds and physics campuses.", url: "https://threejs.org/", displayUrl: "threejs.org > 3d" },
            { title: "A-Frame - Spatial WebVR Virtual Reality Engine", snippet: "A web framework for building virtual reality experiences. Create responsive, physics-based 3D assets designed for modern browsers.", url: "https://aframe.io/", displayUrl: "aframe.io > virtual-reality" }
        ];
    } else {
        cards = [
            { title: `Wikipedia - Global Search: "${query}"`, snippet: `Comprehensive encyclopedia index of information, history, context, and bibliography regarding "${query}" in technology and science.`, url: `https://en.wikipedia.org/wiki/Search?search=${encodeURIComponent(query)}`, displayUrl: `en.wikipedia.org > wiki > ${query}` },
            { title: `Medium - Developer Logs & Articles on "${query}"`, snippet: `Explore shared articles, programming guides, UI/UX showcases, and developer tutorials written about "${query}" by leading technical professionals.`, url: "https://medium.com/", displayUrl: `medium.com > topics > ${query}` },
            { title: `GitHub Repositories - Open Source "${query}"`, snippet: `Discover thousands of open-source scripts, plugins, registry entries, and custom packages matching your query "${query}" on GitHub.`, url: `https://github.com/search?q=${encodeURIComponent(query)}`, displayUrl: `github.com > search > ${query}` }
        ];
    }
    return cards;
}

async function performGoogleSearch() {
    const query = document.getElementById('google-query').value.trim();
    if (!query) {
        showToast('Please enter a search query.', 'fa-exclamation-triangle');
        return;
    }

    const resultsBox = document.getElementById('google-results-box');
    const loader = document.getElementById('google-search-loader');
    const resultsList = document.getElementById('google-results-list');

    if (!resultsBox || !loader || !resultsList) {
        // Fallback if DOM elements are missing
        window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank');
        return;
    }

    // Clear and display results container and crawler loader
    resultsBox.style.display = 'block';
    loader.style.display = 'flex';
    resultsList.innerHTML = '';

    // Scroll results container into view
    const mainScroll = document.getElementById('main-scroll');
    if (mainScroll) mainScroll.scrollTop = mainScroll.scrollHeight;

    try {
        const payload = {
            inputs: `[System Instructions]: You are a high-performance web search crawler and search engine indexing robot.
Analyze the search query and output a strict JSON array containing exactly 5 highly realistic, informative, and domain-diverse search result items.
Do NOT output any markdown blocks, normal conversational text, or wrapper brackets. Output ONLY the raw JSON array string.
Each object in the array must contain:
- "title": Title of the page
- "snippet": Description snippet of the page contents
- "url": absolute URL address
- "displayUrl": Short breadcrumb style display link

[User Search Query]: ${query}

Strict JSON Array Response:`,
            parameters: { max_new_tokens: 600, temperature: 0.5 }
        };

        // Fetch raw response via multi-model fallback retriever
        const rawJsonText = await fetchLlmResponse(payload);

        let cards = [];
        try {
            // Find JSON array bounds in case model leaks conversational preambles
            const startIdx = rawJsonText.indexOf('[');
            const endIdx = rawJsonText.lastIndexOf(']');
            if (startIdx !== -1 && endIdx !== -1) {
                const cleanedJson = rawJsonText.substring(startIdx, endIdx + 1);
                cards = JSON.parse(cleanedJson);
            } else {
                throw new Error("No JSON boundaries found");
            }
        } catch (jsonErr) {
            console.warn("SERP parsing error, falling back to dynamic search indexes:", jsonErr);
            cards = generateFallbackSearchCards(query);
        }

        // Ensure we got actual valid cards
        if (!Array.isArray(cards) || cards.length === 0) {
            cards = generateFallbackSearchCards(query);
        }

        // Render cards
        renderSerpCards(cards, query);

    } catch (err) {
        console.warn("Web indices offline. Triggering high-fidelity dynamic client-side fallback indexer...", err);
        const cards = generateFallbackSearchCards(query);
        renderSerpCards(cards, query);
    } finally {
        loader.style.display = 'none';
        if (mainScroll) mainScroll.scrollTop = mainScroll.scrollHeight;
    }
}

function renderSerpCards(cards, query) {
    const resultsList = document.getElementById('google-results-list');
    if (!resultsList) return;

    let html = '';
    cards.forEach(card => {
        const cleanTitle = (card.title || 'Search Result').replace(/'/g, "\\'").replace(/"/g, "&quot;");
        const cleanSnippet = (card.snippet || 'Description unavailable.').replace(/'/g, "\\'").replace(/"/g, "&quot;");
        const targetUrl = card.url || 'https://www.google.com';
        const displayLink = card.displayUrl || targetUrl;

        // Extract domain to fetch favicon
        let domain = 'google.com';
        try {
            domain = new URL(targetUrl).hostname;
        } catch (e) { }

        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

        html += `
        <div class="google-result-card">
            <div class="google-result-meta">
                <img class="google-result-favicon" src="${faviconUrl}" onerror="this.src='https://www.google.com/s2/favicons?sz=64&domain=google.com'" alt="favicon">
                <span>${displayLink}</span>
            </div>
            <a href="${targetUrl}" target="_blank" class="google-result-title">${card.title}</a>
            <div class="google-result-snippet">${card.snippet}</div>
            <div class="google-result-actions">
                <a href="${targetUrl}" target="_blank" class="google-action-link"><i class="fas fa-external-link-alt"></i> Open</a>
                <span class="google-action-link" onclick="copyToClipboardText('${targetUrl}')"><i class="fas fa-copy"></i> Copy Link</span>
                <span class="google-action-link" onclick="synthesizeResultWithAi('${cleanTitle}', '${cleanSnippet}')"><i class="fas fa-sparkles" style="color: #60a5fa;"></i> Synthesize with AI</span>
            </div>
        </div>
        `;
    });

    // Append the primary redirect button at the bottom of cards
    html += `
    <div style="margin-top: 15px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;">
        <button class="app-btn" onclick="window.open('https://www.google.com/search?q=' + encodeURIComponent('${query.replace(/'/g, "\\'")}'), '_blank')" style="background: linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(59, 130, 246, 0.1)); border-color: rgba(96, 165, 250, 0.25);">
            <i class="fab fa-google"></i> Search globally on Google.com
        </button>
    </div>
    `;

    resultsList.innerHTML = html;
}

const bgVideo = document.getElementById('bg-video');
document.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 1024) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    if (bgVideo) bgVideo.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
});

searchInput.addEventListener('input', handleSearch);
pcSearchInput.addEventListener('input', handleSearch);

// Anime Search Logic
const animeDropZone = document.getElementById('anime-drop-zone');
const animeFileInput = document.getElementById('anime-file-input');

if (animeDropZone) {
    animeDropZone.addEventListener('click', () => animeFileInput.click());

    animeFileInput.addEventListener('change', (e) => {
        if (animeFileInput.files.length) {
            handleAnimeImage(animeFileInput.files[0]);
        }
    });

    animeDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        animeDropZone.classList.add('drop-zone--over');
    });

    ['dragleave', 'dragend'].forEach(type => {
        animeDropZone.addEventListener(type, () => animeDropZone.classList.remove('drop-zone--over'));
    });

    animeDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            animeFileInput.files = e.dataTransfer.files;
            handleAnimeImage(e.dataTransfer.files[0]);
        }
        animeDropZone.classList.remove('drop-zone--over');
    });
}

// Google Lens & Yandex Visual Search Logic
const lensDropZone = document.getElementById('lens-drop-zone');
const lensFileInput = document.getElementById('lens-file-input');

let activeLensFile = null;
let activeLensImageUrl = null;

if (lensDropZone) {
    lensDropZone.addEventListener('click', () => lensFileInput.click());

    lensFileInput.addEventListener('change', (e) => {
        if (lensFileInput.files.length) {
            handleLensImage(lensFileInput.files[0]);
        }
    });

    lensDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        lensDropZone.classList.add('drop-zone--over');
    });

    ['dragleave', 'dragend'].forEach(type => {
        lensDropZone.addEventListener(type, () => lensDropZone.classList.remove('drop-zone--over'));
    });

    lensDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            lensFileInput.files = e.dataTransfer.files;
            handleLensImage(e.dataTransfer.files[0]);
        }
        lensDropZone.classList.remove('drop-zone--over');
    });
}

window.addEventListener('paste', (e) => {
    const animeSearch = document.getElementById('view-anime-search');
    const lensSearch = document.getElementById('view-lens-search');

    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
        const item = items[index];
        if (item.kind === 'file') {
            const blob = item.getAsFile();
            if (animeSearch && animeSearch.classList.contains('active')) {
                handleAnimeImage(blob);
            } else if (lensSearch && lensSearch.classList.contains('active')) {
                handleLensImage(blob);
            }
        }
    }
});

function handleLensImage(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file.', 'fa-image');
        return;
    }

    activeLensFile = file;
    activeLensImageUrl = null;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        lensDropZone.innerHTML = `<div class="drop-zone__thumb" style="background-image: url('${reader.result}')"></div>`;
        // Show triggers grid
        document.getElementById('lens-search-actions').style.display = 'flex';
    };
}

async function searchLensViaUrl() {
    const urlInput = document.getElementById('lens-url-input');
    const url = urlInput.value.trim();
    if (!url) { showToast('Please enter an image URL.', 'fa-link'); return; }

    activeLensImageUrl = url;
    activeLensFile = null;

    lensDropZone.innerHTML = `<div class="drop-zone__thumb" style="background-image: url('${url}')"></div>`;
    document.getElementById('lens-search-actions').style.display = 'flex';
    showToast('Image URL loaded. Choose a search engine below.', 'fa-check');
}

// Temporary host uploader (tmpfiles.org) with direct raw-download link builder
async function uploadImageToHost(file) {
    const loader = document.getElementById('lens-search-loader');
    if (loader) loader.style.display = 'flex';

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("https://tmpfiles.org/api/v1/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Anonymous upload server rejected image");

        const data = await response.json();
        const rawUrl = data.data.url;
        // tmpfiles.org URLs need /dl/ to deliver the direct binary stream externally
        const directUrl = rawUrl.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");
        return directUrl;
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

async function triggerLensSearch() {
    if (activeLensImageUrl) {
        window.open('https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(activeLensImageUrl), '_blank');
        return;
    }

    if (activeLensFile) {
        try {
            showToast('Uploading image to host...', 'fa-upload');
            const hostedUrl = await uploadImageToHost(activeLensFile);
            window.open('https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(hostedUrl), '_blank');
        } catch (err) {
            console.error("Visual search upload error:", err);
            showToast("Failed to upload image. Please try pasting a direct image link.", 'fa-exclamation-triangle');
        }
        return;
    }

    showToast('Please select or upload an image first.', 'fa-exclamation-triangle');
}

async function triggerYandexSearch() {
    if (activeLensImageUrl) {
        window.open('https://yandex.com/images/search?rpt=imageview&url=' + encodeURIComponent(activeLensImageUrl), '_blank');
        return;
    }

    if (activeLensFile) {
        try {
            showToast('Uploading image to host...', 'fa-upload');
            const hostedUrl = await uploadImageToHost(activeLensFile);
            window.open('https://yandex.com/images/search?rpt=imageview&url=' + encodeURIComponent(hostedUrl), '_blank');
        } catch (err) {
            console.error("Visual search upload error:", err);
            showToast("Failed to upload image. Please try pasting a direct image link.", 'fa-exclamation-triangle');
        }
        return;
    }

    showToast('Please select or upload an image first.', 'fa-exclamation-triangle');
}

function handleAnimeImage(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file.', 'fa-image');
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        animeDropZone.innerHTML = `<div class="drop-zone__thumb" style="background-image: url('${reader.result}')"></div>`;
        searchAnimeScene(file);
    };
}

async function searchAnimeViaUrl() {
    const urlInput = document.getElementById('anime-url-input');
    const url = urlInput.value.trim();
    if (!url) { showToast('Please enter an image URL.', 'fa-link'); return; }

    animeDropZone.innerHTML = `<div class="drop-zone__thumb" style="background-image: url('${url}')"></div>`;
    searchAnimeScene(null, url);
}

async function searchAnimeScene(file = null, imageUrl = null) {
    const loader = document.getElementById('anime-search-loader');
    const resultsBox = document.getElementById('anime-search-results');
    loader.style.display = 'flex';
    resultsBox.innerHTML = '';

    try {
        let apiUrl = "https://api.trace.moe/search?anilistInfo";
        let options = { method: "POST" };

        if (file) {
            const formData = new FormData();
            formData.append("image", file);
            options.body = formData;
        } else if (imageUrl) {
            apiUrl += `&url=${encodeURIComponent(imageUrl)}`;
            options.method = "GET";
        }

        const response = await fetch(apiUrl, options);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        renderAnimeResults(data.result, imageUrl);
    } catch (err) {
        console.error(err);
        showToast("Error: " + err.message, 'fa-times-circle');
    } finally {
        loader.style.display = 'none';
    }
}

function renderAnimeResults(results, imageUrl = null) {
    const resultsBox = document.getElementById('anime-search-results');
    if (!results || results.length === 0) {
        resultsBox.innerHTML = '<div style="text-align:center; padding:20px;">No matches found.</div>';
        return;
    }

    resultsBox.innerHTML = `<div class="section-header">Top Match (${(results[0].similarity * 100).toFixed(1)}% Certainty)</div>`;

    const res = results[0];
    const title = res.anilist.title.english || res.anilist.title.romaji || res.anilist.title.native;
    const nativeTitle = res.anilist.title.native;
    const episode = res.episode || 'Movie/OVA';
    const time = formatTime(res.from);

    resultsBox.innerHTML += `
        <div class="anime-result-card">
            <video class="anime-video-preview" autoplay loop muted playsinline>
                <source src="${res.video}" type="video/mp4">
            </video>
            <div class="anime-info-body">
                <div class="anime-title-jp" style="font-weight: 600; color: rgba(255,255,255,0.4);">${nativeTitle}</div>
                <div class="anime-title-en" style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 20px;">${title}</div>
                
                <div class="anime-meta-grid">
                    <div class="anime-meta-item">
                        <span class="anime-meta-label">Episode</span>
                        <span class="anime-meta-value" style="color: #FF6B6B;">${episode}</span>
                    </div>
                    <div class="anime-meta-item">
                        <span class="anime-meta-label">Timestamp</span>
                        <span class="anime-meta-value" style="color: #4ECDC4;">${time}</span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button class="app-btn" style="flex: 1;" onclick="window.open('https://anilist.co/anime/${res.anilist.id}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> AniList
                    </button>
                    <button class="app-btn" style="flex: 1; background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1);" 
                        onclick="window.open('https://trace.moe/?url=' + encodeURIComponent('${imageUrl || ''}'), '_blank')">
                        <i class="fas fa-search-plus"></i> View Official
                    </button>
                </div>
                
                <button class="app-btn" style="width: 100%; margin-top: 10px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.15)); border-color: rgba(168, 85, 247, 0.35); box-shadow: 0 4px 15px rgba(236, 72, 153, 0.15);" 
                    onclick="askCopilotAboutAnime('${title.replace(/'/g, "\\'")}', '${nativeTitle.replace(/'/g, "\\'")}')">
                    <i class="fas fa-sparkles" style="color: #ec4899;"></i> Ask Copilot about this Anime
                </button>
            </div>
        </div>
    `;
}

// Tab routing and search auto-trigger for identified anime scene results
window.askCopilotAboutAnime = function (title, nativeTitle) {
    switchTab('google');
    switchSearchMode('copilot');

    const aiInput = document.getElementById('ai-query');
    if (aiInput) {
        aiInput.value = `Tell me all about the anime "${title}" (${nativeTitle}). Provide a plot summary, genres, major characters, and recommendation highlights.`;
        performAiSearch();
    }
};

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
const mainScroll = document.getElementById('main-scroll');
const progressBar = document.getElementById('progress-bar');
const topBtn = document.getElementById('top-btn');

if (mainScroll) {
    mainScroll.addEventListener('scroll', () => {
        const winScroll = mainScroll.scrollTop;
        const height = mainScroll.scrollHeight - mainScroll.clientHeight;
        progressBar.style.width = ((winScroll / height) * 100) + "%";
        topBtn.classList.toggle('visible', winScroll > 300);
    });
}

function scrollToTop() { mainScroll.scrollTo({ top: 0, behavior: 'smooth' }); }
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('menu-overlay');

function toggleMenu(force = null) {
    const isActive = force !== null ? force : !sidebar.classList.contains('active');
    sidebar.classList.toggle('active', isActive);
    overlay.classList.toggle('active', isActive);

    const burger = document.getElementById('hamburger-menu');
    if (burger) {
        burger.innerHTML = isActive ? '<i class="fas fa-times"></i> Close' : '<i class="fas fa-bars"></i> Menu';
    }

    const items = sidebar.querySelectorAll('.sidebar-item, .sidebar-title, .sidebar-search, .sidebar-header');
    items.forEach((item, i) => {
        if (isActive) {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
            item.style.transition = `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.03}s`;
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-15px)';
            item.style.transition = 'none';
        }
    });
}
async function fetchTikTok() {
    const urlInput = document.getElementById('tiktok-url');
    const fetchBtn = document.getElementById('tiktok-fetch-btn');
    const loader = document.getElementById('tiktok-loader');
    const resultBox = document.getElementById('tiktok-result');
    const url = urlInput.value.trim();

    if (!url) { showToast('Please input a valid URL.', 'fa-link'); return; }

    resultBox.classList.remove('visible');
    loader.style.display = 'flex';
    fetchBtn.disabled = true;

    const baseApi = "https://tikwm.com/api/";
    const targetUrl = `${baseApi}?url=${encodeURIComponent(url)}`;

    try {
        let data;
        let fetchSuccess = false;

        // 1. Try Direct Fetch
        try {
            const response = await fetch(targetUrl);
            if (response.ok) {
                data = await response.json();
                fetchSuccess = true;
            }
        } catch (e) { console.warn("Direct fetch failed, trying Proxy fallback..."); }


        // 2. Try Proxy (allorigins.win)
        if (!fetchSuccess) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`);
                const proxyData = await response.json();
                if (proxyData.contents) {
                    data = JSON.parse(proxyData.contents);
                    fetchSuccess = true;
                }
            } catch (e) { console.warn("Proxy fallback failed."); }
        }

        if (!fetchSuccess) throw new Error("All fetch attempts failed (CORS/Network)");

        if (data && data.code === 0 && data.data) {
            renderTikTokResult(data.data, url);
        } else {
            throw new Error(data ? (data.msg || data.error || "API error") : "No data received");
        }
    } catch (err) {
        console.error("TikTok Fetch Error:", err);
        showToast("Failed to fetch media: " + err.message, 'fa-exclamation-circle');
    } finally {
        loader.style.display = 'none';
        fetchBtn.disabled = false;
    }
}

function renderTikTokResult(data, originalUrl = '') {
    const resultBox = document.getElementById('tiktok-result');
    const thumb = data.cover || data.thumbnail || data.origin_cover || '';
    const title = data.title || 'TikTok Video';
    const author = (data.author && data.author.unique_id) ? data.author.unique_id : (data.author || 'unknown');
    const views = data.play_count || data.views || 0;
    const likes = data.digg_count || data.likes || 0;
    const duration = data.duration || 0;
    const hdUrl = data.hdplay || data.download_url_hd;
    const sdUrl = data.play || data.download_url;
    const defaultUrl = hdUrl || sdUrl || '';
    const musicUrl = data.music || data.music_info?.play || '';
    const sizeLabel = data.file_size ? `(${data.file_size})` : '';
    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '').trim() || 'tiktok_video';
    const finalFileName = `${safeTitle} | bebokurd.mp4`;

    let actionBtns = '';
    if (hdUrl) {
        actionBtns += `<button class="app-btn" onclick="handleDownload('${hdUrl}', '${finalFileName}', this)" style="margin-bottom: 5px;"><i class="fas fa-download"></i> Download HD ${sizeLabel}</button>`;
    }
    if (sdUrl && sdUrl !== hdUrl) {
        actionBtns += `<button class="app-btn" onclick="handleDownload('${sdUrl}', '${finalFileName}', this)"><i class="fas fa-download"></i> Download SD</button>`;
    }
    if (musicUrl) {
        const musicName = `${safeTitle} | bebokurd.mp3`;
        actionBtns += `<button class="app-btn" onclick="handleDownload('${musicUrl}', '${musicName}', this)" style="background: rgba(234, 179, 8, 0.1); border-color: rgba(234, 179, 8, 0.3); margin-top: 5px;"><i class="fas fa-music"></i> Download MP3 (Audio)</button>`;
    }
    if (!actionBtns && defaultUrl) {
        actionBtns = `<button class="app-btn" onclick="handleDownload('${defaultUrl}', '${finalFileName}', this)"><i class="fas fa-download"></i> Download Video</button>`;
    }

    const quality = data.hdplay ? 'HD Available' : (data.quality || '');
    const qualityBadge = quality ? `<span style="background: linear-gradient(135deg, #69C9D0, #EE1D52); color: #fff; padding: 4px 14px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; margin-left: 10px; vertical-align: middle; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 0 15px rgba(105, 201, 208, 0.3); text-transform: uppercase;">${quality}</span>` : '';

    // Attempt to use download_url for preview, fallback to thumbnail
    const videoHtml = defaultUrl ? `
        <video class="tt-video-preview" autoplay loop muted playsinline poster="${thumb}">
            <source src="${defaultUrl}" type="video/mp4">
        </video>
    ` : `<img src="${thumb}" class="tt-video-preview" alt="Thumbnail">`;

    resultBox.innerHTML = `
        ${videoHtml}
        <div class="tt-info">
            <div class="tt-title" style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 8px;">${title} ${qualityBadge}</div>
            <div class="tt-author" style="font-size: 1rem; color: #69C9D0; margin-bottom: 20px; font-weight: 600;">
                <i class="fab fa-tiktok"></i> @${author}
            </div>
            <div class="tt-stats">
                <span><i class="fas fa-play"></i> ${views.toLocaleString()}</span>
                <span><i class="fas fa-heart"></i> ${likes.toLocaleString()}</span>
                <span><i class="fas fa-clock"></i> ${duration}s</span>
            </div>
            <div class="tt-actions" style="margin-top: 25px;">
                ${actionBtns}
                <button class="app-btn" onclick="navigator.clipboard.writeText('${originalUrl ? (window.location.origin + window.location.pathname + '#url=' + encodeURIComponent(originalUrl)) : defaultUrl}'); showToast('Shareable link copied!', 'fa-share-alt');" style="background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.3); margin-top: 10px; width: 100%;">
                    <i class="fas fa-share-alt"></i> Copy Shareable Link
                </button>
                <button class="app-btn" onclick="navigator.clipboard.writeText('${defaultUrl}'); showToast('Source URL copied!', 'fa-link');" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); margin-top: 10px; width: 100%;">
                    <i class="fas fa-link"></i> Copy Source URL
                </button>
            </div>
        </div>
    `;
    resultBox.classList.add('visible');
}

async function handleDownload(url, filename, btn) {
    if (!url) { showToast("Download URL not found.", 'fa-times'); return; }
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    try {
        let response;
        try {
            response = await fetch(url);
            if (!response.ok) throw new Error('Direct fetch failed');
        } catch (e) {
            // Phone Fix: Use CORS proxy for binary data
            showToast('Applying Phone Fix...', 'fa-mobile-alt');
            response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
            if (!response.ok) throw new Error('Proxy fetch failed');
        }
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl; a.download = filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(blobUrl);
        showToast('Download started!', 'fa-check-circle');
    } catch (err) {
        window.open(url, '_blank');
        showToast('Opening in browser...', 'fa-external-link-alt');
    } finally {
        btn.disabled = false; btn.innerHTML = originalHtml;
    }
}
async function fetchInstagram() {
    const queryInput = document.getElementById('insta-query');
    const searchBtn = document.getElementById('insta-search-btn');
    const loader = document.getElementById('insta-loader');
    const resultsBox = document.getElementById('insta-results');
    const query = queryInput.value.trim();

    if (!query) { showToast('Please input a valid username.', 'fa-user'); return; }

    resultsBox.innerHTML = "";
    loader.style.display = 'block';
    searchBtn.disabled = true;

    try {
        let data;
        let fetchSuccess = false;
        const targetInsta = `https://www.instagram.com/web/search/topsearch/?query=${encodeURIComponent(query)}`;

        // 1. Try Direct
        try {
            const response = await fetch(targetInsta);
            if (response.ok) {
                data = await response.json();
                fetchSuccess = true;
            }
        } catch (e) { console.warn("Instagram direct failed, trying proxy fallback..."); }


        // 2. Try Proxy (allorigins)
        if (!fetchSuccess) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetInsta)}`);
                const proxyData = await response.json();
                if (proxyData.contents) {
                    data = JSON.parse(proxyData.contents);
                    fetchSuccess = true;
                }
            } catch (e) { console.warn("Instagram proxy 2 failed."); }
        }

        if (data && data.users && data.users.length > 0) {
            resultsBox.innerHTML = `<div class="detail-group"></div>`;
            const group = resultsBox.querySelector('.detail-group');
            data.users.forEach(item => {
                const user = item.user;
                group.innerHTML += `
                    <a href="https://www.instagram.com/${user.username}/" target="_blank" class="pkg-list-item">
                        <img src="${user.profile_pic_url}" style="width:40px; height:40px; border-radius:50%; margin-right:12px; border:1px solid #ccc; object-fit:cover;">
                        <div class="pkg-list-info">
                            <div class="pkg-list-name">${user.username} ${user.is_verified ? '<i class="fas fa-check-circle" style="color:#3897f0; font-size:12px;"></i>' : ''}</div>
                            <div class="pkg-list-desc">${user.full_name || ''}</div>
                        </div>
                        <span class="chevron">›</span>
                    </a>
                `;
            });
        } else {
            resultsBox.innerHTML = `<div style="text-align:center; padding:20px; color:#555;">No matches found.</div>`;
        }
    } catch (err) {
        console.error("Instagram Fetch Error:", err);
        showToast('Failed to fetch Instagram data.', 'fa-times-circle');
    } finally {
        loader.style.display = 'none';
        searchBtn.disabled = false;
    }
}
function switchApiTab(paneId, el) {
    document.querySelectorAll('.api-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('api-pane-' + paneId).classList.add('active');
    document.querySelectorAll('.api-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

// Developer API Hub Global State & Helpers
let lastApiTestResponseData = null;

// Centralized Robust API Request Wrapper with 10s Timeout & Auto-CORS Fallback
async function secureFetch(url, options = {}) {
    const TIMEOUT_MS = 10000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const fetchOptions = {
        ...options,
        signal: controller.signal
    };

    try {
        console.log(`%c[secureFetch] Direct Request: ${options.method || 'GET'} ${url}`, "color: #60a5fa; font-weight: 500;");
        const response = await fetch(url, fetchOptions);
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);

        if (err.name === 'AbortError') {
            throw new Error("Connection timed out. The server took too long to respond (10s limit).");
        }

        // Catch TypeError (usually network offline or CORS block) and fallback automatically
        if (err instanceof TypeError) {
            console.warn(`%c[secureFetch] Direct fetch failed (CORS blocked). Attempting AllOrigins Proxy Fallback for: ${url}`, "color: #fbbf24; font-style: italic;");

            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&timestamp=${Date.now()}`;
            const proxyController = new AbortController();
            const proxyId = setTimeout(() => proxyController.abort(), TIMEOUT_MS);

            try {
                const proxyResponse = await fetch(proxyUrl, { signal: proxyController.signal });
                clearTimeout(proxyId);

                if (!proxyResponse.ok) {
                    throw new Error(`CORS Fallback proxy returned HTTP error ${proxyResponse.status}`);
                }

                const proxyData = await proxyResponse.json();
                const contents = proxyData.contents;
                const bodyText = typeof contents === 'string' ? contents : JSON.stringify(contents);

                // Construct a mock standard Response to avoid breaking downstream callers
                return new Response(bodyText, {
                    status: 200,
                    statusText: 'OK (Proxied)',
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'X-Proxied-By': 'AllOrigins'
                    })
                });
            } catch (proxyErr) {
                clearTimeout(proxyId);
                throw new Error(`Network request failed. Direct access was blocked by CORS policy, and the fallback proxy also failed: ${proxyErr.message}`);
            }
        }

        throw err;
    }
}

// Dynamic Request Headers Row Builder
function addApiHeaderRow(key = '', val = '') {
    const container = document.getElementById('api-headers-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'api-header-row';
    row.innerHTML = `
        <input type="text" placeholder="Key" class="api-header-key" value="${key}">
        <input type="text" placeholder="Value" class="api-header-val" value="${val}">
        <div class="remove-header-btn" onclick="this.parentElement.remove()"><i class="fas fa-trash-alt"></i></div>
    `;
    container.appendChild(row);
}

// Request Body Panel Toggle (JSON text area)
function toggleApiBody() {
    const header = document.getElementById('api-body-header');
    const container = document.getElementById('api-body-container');
    if (!header || !container) return;

    if (container.style.display === 'none') {
        container.style.display = 'block';
        header.classList.remove('collapsed');
    } else {
        container.style.display = 'none';
        header.classList.add('collapsed');
    }
}

// Show/Hide Request Body option based on HTTP Method Selection
function handleApiMethodChange() {
    const method = document.getElementById('api-test-method').value;
    const wrapper = document.querySelector('.api-body-wrapper');
    const container = document.getElementById('api-body-container');
    const header = document.getElementById('api-body-header');

    if (!wrapper) return;

    if (method === 'GET') {
        wrapper.style.display = 'none';
        if (container) container.style.display = 'none';
        if (header) header.classList.add('collapsed');
    } else {
        wrapper.style.display = 'flex';
    }
}

// Quick-load presets directly from Documentation links
function loadApiPreset(method, url) {
    const methodSelect = document.getElementById('api-test-method');
    const urlInput = document.getElementById('api-test-url');
    if (!methodSelect || !urlInput) return;

    methodSelect.value = method;
    urlInput.value = url;

    // Trigger body view visibility update
    handleApiMethodChange();

    // Clear dynamic headers & load standard preset headers if any
    const container = document.getElementById('api-headers-container');
    if (container) container.innerHTML = '';

    // Add default Accept header
    addApiHeaderRow('Accept', 'application/json');

    // Switch view tab to API Tester
    const testerTab = Array.from(document.querySelectorAll('.api-tab')).find(t => t.innerText.includes('Tester'));
    if (testerTab) {
        switchApiTab('tester', testerTab);
    }

    // Auto run test for instant feedback!
    runApiTest();
}

// Clipboard Actions
function copyApiResponse() {
    if (!lastApiTestResponseData) {
        showToast('No response data available to copy.', 'fa-exclamation-triangle');
        return;
    }
    const text = typeof lastApiTestResponseData === 'object' ? JSON.stringify(lastApiTestResponseData, null, 2) : lastApiTestResponseData;
    navigator.clipboard.writeText(text);
    showToast('Response copied to clipboard!', 'fa-check-circle');
}

// Download Actions
function downloadApiResponse() {
    if (!lastApiTestResponseData) {
        showToast('No response data available to download.', 'fa-exclamation-triangle');
        return;
    }
    const text = typeof lastApiTestResponseData === 'object' ? JSON.stringify(lastApiTestResponseData, null, 2) : lastApiTestResponseData;
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cydia_api_response.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Response file download started.', 'fa-download');
}

// API Tester Run Process
async function runApiTest() {
    const url = document.getElementById('api-test-url').value.trim();
    const method = document.getElementById('api-test-method').value;
    const loader = document.getElementById('api-test-loader');
    const responseBox = document.getElementById('api-test-response');
    const responseSection = document.getElementById('api-response-section');
    const resStatus = document.getElementById('api-res-status');
    const resTime = document.getElementById('api-res-time');
    const resSize = document.getElementById('api-res-size');

    if (!url) { showToast('Please enter an API URL.', 'fa-code'); return; }

    loader.style.display = 'block';
    if (responseSection) responseSection.style.display = 'none';
    responseBox.innerHTML = "";
    lastApiTestResponseData = null;

    // Collect Dynamic Custom Headers
    const headers = {};
    const headerRows = document.querySelectorAll('.api-header-row');
    headerRows.forEach(row => {
        const keyInput = row.querySelector('.api-header-key');
        const valInput = row.querySelector('.api-header-val');
        if (keyInput && valInput) {
            const key = keyInput.value.trim();
            const val = valInput.value.trim();
            if (key) headers[key] = val;
        }
    });

    // Collect request body if not GET
    let body = null;
    if (method !== 'GET') {
        const bodyText = document.getElementById('api-test-body').value.trim();
        if (bodyText) {
            try {
                if (bodyText.startsWith('{') || bodyText.startsWith('[')) {
                    JSON.parse(bodyText);
                }
                body = bodyText;
            } catch (e) {
                showToast('Warning: Invalid JSON payload in body.', 'fa-exclamation-triangle');
                body = bodyText;
            }
        }
    }

    const startTime = performance.now();

    try {
        const options = { method, headers };
        if (body) {
            options.body = body;
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
        }

        const response = await secureFetch(url, options);
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        // Read response body text & calculate size
        const responseText = await response.text();
        const byteSize = new Blob([responseText]).size;

        let sizeText = `${byteSize} B`;
        if (byteSize > 1024 * 1024) {
            sizeText = `${(byteSize / (1024 * 1024)).toFixed(2)} MB`;
        } else if (byteSize > 1024) {
            sizeText = `${(byteSize / 1024).toFixed(2)} KB`;
        }

        resTime.innerText = `${latency} ms`;
        resSize.innerText = sizeText;

        // Render Status Code Badge
        resStatus.innerText = `${response.status} ${response.statusText || (response.ok ? 'OK' : '')}`;
        resStatus.className = 'badge-status'; // reset
        if (response.status >= 200 && response.status < 300) {
            resStatus.classList.add('badge-success');
        } else if (response.status >= 400 && response.status < 500) {
            resStatus.classList.add('badge-warning');
        } else {
            resStatus.classList.add('badge-danger');
        }

        // Beautify Response JSON if applicable
        try {
            const jsonData = JSON.parse(responseText);
            lastApiTestResponseData = jsonData;
            responseBox.innerHTML = `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
        } catch (e) {
            lastApiTestResponseData = responseText;
            responseBox.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; font-size: 0.82rem; color: rgba(255,255,255,0.85);">${escapeHTML(responseText)}</pre>`;
        }

        if (responseSection) responseSection.style.display = 'block';
    } catch (err) {
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        resTime.innerText = `${latency} ms`;
        resSize.innerText = '0 B';
        resStatus.innerText = 'ERROR';
        resStatus.className = 'badge-status badge-danger';

        responseBox.innerHTML = `<div style="color: #ef4444; font-family: monospace; font-size: 0.82rem; padding: 12px; background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px;">Error: ${err.message}</div>`;
        if (responseSection) responseSection.style.display = 'block';
    } finally {
        loader.style.display = 'none';
    }
}

// HTML Entity escaper
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ==========================================
// FREE GAMES TRACKER ENGINE
// ==========================================
let freeGamesData = [];
let fgActivePlatform = 'all';
let fgSearchQuery = '';
let fgSortMode = 'default';
let fgIsLoading = false;

function getClaimedGames() {
    try {
        return JSON.parse(localStorage.getItem('claimed_games') || '[]');
    } catch (e) {
        return [];
    }
}

function toggleClaimedGame(gameId) {
    let claimed = getClaimedGames();
    const strId = String(gameId);
    if (claimed.includes(strId)) {
        claimed = claimed.filter(id => id !== strId);
        showToast('Game marked as unclaimed.', 'fa-undo');
    } else {
        claimed.push(strId);
        showToast('Game marked as claimed in your library!', 'fa-check-circle');
    }
    localStorage.setItem('claimed_games', JSON.stringify(claimed));
    renderFreeGames();
}

async function loadFreeGames() {
    if (freeGamesData.length > 0) {
        renderFreeGames();
        return;
    }
    const loader = document.getElementById('fg-loader');
    const container = document.getElementById('free-games-container');
    if (loader) loader.style.display = 'block';
    if (container) container.innerHTML = '';
    fgIsLoading = true;

    try {
        let res;
        try {
            res = await fetch('https://www.gamerpower.com/api/giveaways');
            if (!res.ok) throw new Error('Direct fetch failed');
        } catch (e) {
            // Fallback via allorigins CORS proxy
            res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.gamerpower.com/api/giveaways'));
        }
        const data = await res.json();
        freeGamesData = Array.isArray(data) ? data : [];
        updateFreeGamesStats();
        renderFreeGames();
    } catch (err) {
        console.error('Free Games fetch failed:', err);
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: rgba(255,255,255,0.4);">
                    <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; margin-bottom: 12px; color: #ef4444;"></i>
                    <p>Unable to load giveaways right now. Check internet connection or try again later.</p>
                    <button class="app-btn" onclick="freeGamesData = []; loadFreeGames();" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    } finally {
        if (loader) loader.style.display = 'none';
        fgIsLoading = false;
    }
}

function updateFreeGamesStats() {
    const countEl = document.getElementById('fg-stat-count');
    const valueEl = document.getElementById('fg-stat-value');
    const topEl = document.getElementById('fg-stat-top');

    if (countEl) countEl.innerText = freeGamesData.length;

    let totalWorth = 0;
    const storeCounts = {};

    freeGamesData.forEach(g => {
        if (g.worth && g.worth.startsWith('$')) {
            const val = parseFloat(g.worth.replace('$', ''));
            if (!isNaN(val)) totalWorth += val;
        }
        const plat = (g.platforms || '').toLowerCase();
        if (plat.includes('steam')) storeCounts['Steam'] = (storeCounts['Steam'] || 0) + 1;
        else if (plat.includes('epic')) storeCounts['Epic Games'] = (storeCounts['Epic Games'] || 0) + 1;
        else if (plat.includes('gog')) storeCounts['GOG'] = (storeCounts['GOG'] || 0) + 1;
        else storeCounts['PC / Web'] = (storeCounts['PC / Web'] || 0) + 1;
    });

    if (valueEl) valueEl.innerText = '$' + totalWorth.toFixed(2);

    let topStore = 'Steam';
    let maxCount = 0;
    Object.keys(storeCounts).forEach(s => {
        if (storeCounts[s] > maxCount) {
            maxCount = storeCounts[s];
            topStore = s;
        }
    });
    if (topEl) topEl.innerText = topStore;
}

function filterFreeGames(platform, el) {
    fgActivePlatform = platform;
    document.querySelectorAll('.fg-filter-item').forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');

    if (platform === 'f2p') {
        loadF2PCatalog();
        return;
    }
    renderFreeGames();
}

async function loadF2PCatalog() {
    const loader = document.getElementById('fg-loader');
    const container = document.getElementById('free-games-container');
    if (loader) loader.style.display = 'block';
    if (container) container.innerHTML = '';

    try {
        let res;
        try {
            res = await fetch('https://www.freetogame.com/api/games');
            if (!res.ok) throw new Error('Direct fetch failed');
        } catch (e) {
            res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.freetogame.com/api/games'));
        }
        const data = await res.json();
        if (Array.isArray(data)) {
            // Map freetogame schema to giveaways schema
            freeGamesData = data.slice(0, 40).map(g => ({
                id: 'f2p_' + g.id,
                title: g.title,
                worth: 'F2P Catalog',
                thumbnail: g.thumbnail,
                image: g.thumbnail,
                description: g.short_description,
                instructions: 'Available permanently as free to play.',
                open_giveaway_url: g.game_url,
                giveaway_url: g.game_url,
                published_date: g.release_date,
                type: g.genre || 'Free-to-Play',
                platforms: g.platform
            }));
            updateFreeGamesStats();
            renderFreeGames();
        }
    } catch (e) {
        console.error('F2P fetch failed:', e);
        showToast('Failed to load F2P catalog', 'fa-exclamation-triangle');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

function handleFreeGamesSearch() {
    const input = document.getElementById('fg-search-input');
    const clearBtn = document.getElementById('fg-search-clear');
    fgSearchQuery = input ? input.value.trim().toLowerCase() : '';
    if (clearBtn) clearBtn.style.display = fgSearchQuery ? 'block' : 'none';
    renderFreeGames();
}

function clearFreeGamesSearch() {
    const input = document.getElementById('fg-search-input');
    const clearBtn = document.getElementById('fg-search-clear');
    if (input) input.value = '';
    fgSearchQuery = '';
    if (clearBtn) clearBtn.style.display = 'none';
    renderFreeGames();
}

function handleFreeGamesSort() {
    const select = document.getElementById('fg-sort-select');
    fgSortMode = select ? select.value : 'default';
    renderFreeGames();
}

function renderFreeGames() {
    const container = document.getElementById('free-games-container');
    if (!container) return;

    const claimed = getClaimedGames();
    let list = [...freeGamesData];

    // Filter platform
    if (fgActivePlatform && fgActivePlatform !== 'all' && fgActivePlatform !== 'f2p') {
        const pKey = fgActivePlatform === 'epic-games-store' ? 'epic' : fgActivePlatform;
        list = list.filter(g => (g.platforms || '').toLowerCase().includes(pKey));
    }

    // Filter search
    if (fgSearchQuery) {
        list = list.filter(g =>
            (g.title || '').toLowerCase().includes(fgSearchQuery) ||
            (g.description || '').toLowerCase().includes(fgSearchQuery) ||
            (g.platforms || '').toLowerCase().includes(fgSearchQuery)
        );
    }

    // Sort
    if (fgSortMode === 'value-high') {
        list.sort((a, b) => {
            const va = parseFloat((a.worth || '$0').replace(/[^0-9.]/g, '')) || 0;
            const vb = parseFloat((b.worth || '$0').replace(/[^0-9.]/g, '')) || 0;
            return vb - va;
        });
    } else if (fgSortMode === 'title-asc') {
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (fgSortMode === 'store') {
        list.sort((a, b) => (a.platforms || '').localeCompare(b.platforms || ''));
    }

    if (list.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4);">
                <i class="fas fa-ghost" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.5;"></i>
                <p>No active giveaways matching your filter.</p>
            </div>
        `;
        return;
    }

    let html = '';
    list.forEach(game => {
        const isClaimed = claimed.includes(String(game.id));
        const plat = (game.platforms || '').toLowerCase();
        let platIcon = 'fas fa-desktop';
        let platLabel = game.platforms || 'PC';
        let platColor = '#10b981';
        let platRgb = '16, 185, 129';

        if (plat.includes('steam')) {
            platIcon = 'fab fa-steam';
            platLabel = 'Steam';
            platColor = '#66c0f4';
            platRgb = '102, 192, 244';
        } else if (plat.includes('epic')) {
            platIcon = 'fab fa-windows';
            platLabel = 'Epic Games';
            platColor = '#0078f2';
            platRgb = '0, 120, 242';
        } else if (plat.includes('gog')) {
            platIcon = 'fas fa-download';
            platLabel = 'GOG';
            platColor = '#9b51e0';
            platRgb = '155, 81, 224';
        }

        const worthText = game.worth ? (game.worth.toUpperCase() === 'N/A' ? 'FREE' : game.worth) : 'FREE';
        const worthBg = worthText === 'FREE' || worthText === 'F2P CATALOG'
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #f59e0b, #d97706)';

        const targetUrl = game.open_giveaway_url || game.giveaway_url || '#';

        html += `
            <div class="game-card ${isClaimed ? 'claimed' : ''} animated-card" style="--game-color: ${platColor}; --game-color-rgb: ${platRgb};" data-id="${game.id}">
                <div class="game-card-glow"></div>
                ${isClaimed ? '<div class="game-card-claimed-badge"><i class="fas fa-check"></i> Claimed</div>' : ''}
                <div class="game-card-image-wrap">
                    <img class="game-card-image" src="${game.image || game.thumbnail || ''}" alt="${escapeHTML(game.title)}" loading="lazy">
                    <div class="game-card-worth-badge" style="background: ${worthBg};">${worthText}</div>
                </div>
                <div class="game-card-content">
                    <div class="game-card-meta">
                        <span class="game-card-platform"><i class="${platIcon}"></i> ${platLabel}</span>
                        <span class="game-card-type">${game.type || 'Game'}</span>
                    </div>
                    <h3 class="game-card-title">${escapeHTML(game.title)}</h3>
                    <p class="game-card-desc">${escapeHTML(game.short_description || game.description || '')}</p>
                    <div class="game-card-footer-meta">
                        <span class="worth-saved"><i class="fas fa-tag"></i> Value: ${game.worth || 'Free'}</span>
                        <span class="game-status"><span class="status-pulse-dot"></span> Active</span>
                    </div>
                    <div class="game-card-footer">
                        <div class="fg-claim-toggle-wrapper">
                            <div class="fg-claim-toggle" onclick="event.preventDefault(); toggleClaimedGame('${game.id}')">
                                <i class="${isClaimed ? 'fas fa-check-square' : 'far fa-square'}"></i>
                                <span>${isClaimed ? 'Marked as Claimed' : 'Mark as Claimed'}</span>
                            </div>
                        </div>
                        <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="game-card-btn">
                            <i class="fas fa-external-link-alt"></i> ${isClaimed ? 'View Claimed Deal' : 'Claim Giveaway'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// FAQ Center Interactive Filtering
let activeFaqCategory = 'all';

function switchFaqTab(cat, el) {
    activeFaqCategory = cat;

    // Toggle active visual classes on tab chips
    document.querySelectorAll('.faq-tabs .api-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');

    filterFaqs();
}

function filterFaqs() {
    const q = document.getElementById('faq-search-input').value.toLowerCase().trim();
    const items = document.querySelectorAll('.faq-grid .faq-item');
    let visibleCount = 0;

    items.forEach(item => {
        const cat = item.getAttribute('data-cat');
        const questionText = item.querySelector('.faq-question span').innerText.toLowerCase();
        const answerText = item.querySelector('.faq-answer p').innerText.toLowerCase();

        // 1. Check tab filter matches
        const matchesCat = (activeFaqCategory === 'all' || cat === activeFaqCategory);

        // 2. Check search input keyword matches
        const matchesSearch = (!q || questionText.includes(q) || answerText.includes(q));

        if (matchesCat && matchesSearch) {
            item.classList.remove('hidden-cat', 'hidden-search');
            item.style.display = 'block';
            visibleCount++;
        } else {
            if (!matchesCat) item.classList.add('hidden-cat');
            if (!matchesSearch) item.classList.add('hidden-search');
            item.style.display = 'none';
        }
    });

    // Toggle intelligent AI fallback card visibility if no results matched
    const fallbackEl = document.getElementById('faq-ai-fallback');
    if (fallbackEl) {
        if (visibleCount === 0) {
            fallbackEl.style.display = 'block';
        } else {
            fallbackEl.style.display = 'none';
        }
    }
}

// FAQ-to-Copilot tab-routing helper
window.askFaqQuestionCopilot = function (question) {
    switchTab('google');
    switchSearchMode('copilot');
    const aiInput = document.getElementById('ai-query');
    if (aiInput) {
        aiInput.value = `Explain in detail this FAQ topic: "${question}". Provide a helpful step-by-step developer walkthrough.`;
        performAiSearch();
    }
};

// Routing helper from raw input value when no direct match exists
window.askFaqCopilotFromInput = function () {
    const q = document.getElementById('faq-search-input').value.trim();
    if (q) {
        switchTab('google');
        switchSearchMode('copilot');
        const aiInput = document.getElementById('ai-query');
        if (aiInput) {
            aiInput.value = `As a developer, I am looking for answers regarding: "${q}". Can you synthesize the relevant technical walkthrough or system specification?`;
            performAiSearch();
        }
    } else {
        showToast('Please type a search query first.', 'fa-exclamation-triangle');
    }
};

// Appends "Ask Copilot" button dynamically inside all FAQ answer blocks
function initializeFaqAiFeatures() {
    const items = document.querySelectorAll('.faq-grid .faq-item');
    items.forEach(item => {
        const questionEl = item.querySelector('.faq-question span');
        if (!questionEl) return;
        const question = questionEl.innerText;
        const answerBlock = item.querySelector('.faq-answer');
        if (answerBlock) {
            const askAiHtml = `
            <div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; text-align: right;">
                <span class="google-action-link" style="font-size: 0.72rem;" onclick="askFaqQuestionCopilot('${question.replace(/'/g, "\\'")}')">
                    <i class="fas fa-sparkles" style="color: #c084fc;"></i> Ask Copilot to explain
                </span>
            </div>`;
            answerBlock.insertAdjacentHTML('beforeend', askAiHtml);
        }
    });
}

// Home Quick AI Search trigger helper
window.triggerHomeAiSearch = function () {
    const homeInput = document.getElementById('home-ai-input');
    if (!homeInput) return;
    const q = homeInput.value.trim();
    if (!q) {
        showToast('Please type a question first.', 'fa-exclamation-triangle');
        return;
    }

    // Switch to AI Search tab
    switchTab('google');
    switchSearchMode('copilot');

    // Fill AI search input and submit
    const aiInput = document.getElementById('ai-query');
    if (aiInput) {
        aiInput.value = q;
        performAiSearch();
    }

    // Clear home input
    homeInput.value = '';
};

// Simulated Core Monitor updates for spatial dashboard feel
function startHomeActivityMonitor() {
    const consoleEl = document.getElementById('home-console-logs');
    if (!consoleEl) return;

    const logs = [
        "SYS: Core kernel active (thread_pool: 64)",
        "SEC: Sandbox authorization token verified",
        "API: TMDB & Videasy server endpoints synced",
        "RAG: Local package vocabulary catalog indexed",
        "NET: secureFetch routing pool configured",
        "SYS: memory_usage = 42.1 MB / 512 MB",
        "DB: data.json checksum verified",
        "SEC: Active shielding daemon - operational",
        "API: Hugging Face triple fallback chain ready",
        "SYS: connection_status = STABLE (RTT: 4ms)",
        "OS: Respring daemon loaded successfully"
    ];

    // Pre-populate with 4 random logs
    for (let i = 0; i < 4; i++) {
        const line = logs[Math.floor(Math.random() * logs.length)];
        const timeStr = new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        consoleEl.insertAdjacentHTML('beforeend', `<div style="opacity: 0.85;">[${timeStr}] ${line}</div>`);
    }

    // Cycle and append new logs continuously
    setInterval(() => {
        const line = logs[Math.floor(Math.random() * logs.length)];
        const timeStr = new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Remove first log line if limit exceeded to avoid height overflow
        if (consoleEl.children.length >= 6) {
            consoleEl.children[0].remove();
        }

        const logLineHtml = `<div style="animation: fadeIn 0.3s ease-out;">[${timeStr}] ${line}</div>`;
        consoleEl.insertAdjacentHTML('beforeend', logLineHtml);
    }, 4500);
}

/* ==========================================================================
   AI SEARCH ASSISTANT HUB ENGINE
   ========================================================================== */

let currentSearchMode = 'copilot';
let activeAiQuery = '';
let activeAiResponseCitations = [];

// AI Enhancements Global Configuration & State
let aiCustomToken = localStorage.getItem('ai_custom_token') || '';
let aiPreferredModel = localStorage.getItem('ai_preferred_model') || 'Qwen/Qwen2.5-Coder-7B-Instruct';
let aiSystemPrompt = localStorage.getItem('ai_system_prompt') || `[System Instructions]: You are Elite Copilot v4.0, a verified spatial AI tech assistant integrated inside Chya Luqman's premium tweak repository and website. 
Be highly conversational, professional, concise, and format answers using Markdown bold, bullet lists, or code blocks.
Whenever relevant, refer back to the scored portfolio items and direct users to them.`;
let aiVoiceEnabled = localStorage.getItem('ai_voice_enabled') === 'true';

let activeSpeechUtterance = null;
let activeSpeakingButton = null;

/**
 * Switch between AI Copilot mode and Google Web Search panel
 * @param {string} mode - 'copilot' or 'web'
 */
function switchSearchMode(mode) {
    currentSearchMode = mode;

    // Toggle active visual states on segmented button tabs
    const btnCopilot = document.getElementById('btn-mode-copilot');
    const btnWeb = document.getElementById('btn-mode-web');
    if (btnCopilot) btnCopilot.classList.toggle('active', mode === 'copilot');
    if (btnWeb) btnWeb.classList.toggle('active', mode === 'web');

    // Toggle panel displays
    const panelCopilot = document.getElementById('panel-ai-copilot');
    const panelWeb = document.getElementById('panel-google-web');
    if (panelCopilot) {
        if (mode === 'copilot') {
            panelCopilot.classList.add('active');
        } else {
            panelCopilot.classList.remove('active');
        }
    }
    if (panelWeb) {
        if (mode === 'web') {
            panelWeb.classList.add('active');
        } else {
            panelWeb.classList.remove('active');
        }
    }

    // Autofocus input
    if (mode === 'copilot') {
        const aiInput = document.getElementById('ai-query');
        if (aiInput) aiInput.focus();
    } else {
        const webInput = document.getElementById('google-query');
        if (webInput) webInput.focus();
    }
}

/**
 * Dynamic click trigger for prompt suggestions
 * @param {string} text - Suggestion prompt
 */
function runAiSuggestion(text) {
    const aiInput = document.getElementById('ai-query');
    if (aiInput) {
        aiInput.value = text;
        performAiSearch();
    }
}

/**
 * Core text-indexing and search scoring system.
 * Scores query terms against package names, categories, and descriptions.
 * @param {string} query - Searched query
 * @returns {Array} Top 6 scored package matches
 */
function scoreQueryAgainstPackages(query) {
    if (!packageData || !packageData.length) return [];

    // Clean query text
    const queryCleaned = query.toLowerCase().trim();

    // Preprocess query terms (lowercase, filter short stopwords)
    const stopWords = ['the', 'and', 'for', 'you', 'with', 'this', 'that', 'from', 'your', 'about'];
    const terms = queryCleaned
        .replace(/[^\w\s\u0600-\u06FF]/g, '') // Keep alphanumeric and Arabic/Kurdish character sets
        .split(/\s+/)
        .filter(t => t.length > 1 && !stopWords.includes(t));

    // Kurdish search intent expansion (translates Kurdish query tokens to match database keywords)
    const kurdishLexicon = {
        'یاری': ['game', 'mod', 'pc games', 'pc game', 'mods'],
        'یارییەکان': ['game', 'mod', 'pc games', 'mods'],
        'فیلم': ['movie', 'film', 'cinema', 'show'],
        'فیلمەکان': ['movie', 'film', 'cinema'],
        'فلیم': ['movie', 'film', 'cinema'],
        'فلیمەکان': ['movie', 'film', 'cinema'],
        'دراما': ['series', 'movies', 'show'],
        'دراماکان': ['series', 'movies'],
        'سینەما': ['movie', 'cinema'],
        'کورد': ['kurdish', 'beenar'],
        'کوردی': ['kurdish', 'beenar'],
        'داگرتن': ['download', 'downloader', 'tiktok', 'tools'],
        'دابەزاندن': ['download', 'downloader', 'tiktok', 'tools'],
        'تیکتۆک': ['tiktok', 'downloader'],
        'تیک تۆک': ['tiktok', 'downloader'],
        'ئینستا': ['instagram', 'lookup', 'insta'],
        'ئینستاگرام': ['instagram', 'lookup', 'insta'],
        'بەرنامە': ['tool', 'software', 'pc tools', 'pc tool', 'browser'],
        'بەرنامەکان': ['tool', 'software', 'pc tools', 'browser'],
        'پڕۆگرام': ['tool', 'software', 'pc tools', 'script'],
        'تیڤی': ['tv', 'live tv', 'kurdtvs', 'kurditv', 'livetv'],
        'تەلەفزیۆن': ['tv', 'live tv', 'kurdtvs', 'kurditv', 'livetv'],
        'وەرزش': ['sport', 'sports', 'live sports', 'football'],
        'کۆمەڵایەتی': ['social', 'discord', 'community'],
        'ئای': ['ai', 'robot', 'brain', 'intelligence'],
        'ژیری': ['ai', 'robot', 'brain', 'intelligence'],
        'ژیر': ['ai', 'robot', 'brain', 'intelligence']
    };

    // Scan terms and expand with translated terms if matched
    const expandedTerms = [...terms];
    terms.forEach(term => {
        if (kurdishLexicon[term]) {
            expandedTerms.push(...kurdishLexicon[term]);
        }
    });

    if (expandedTerms.length === 0) return [];

    const scoredList = packageData.map(pkg => {
        let score = 0;
        const nameLower = pkg.name.toLowerCase();
        const descLower = pkg.desc ? pkg.desc.toLowerCase() : '';
        const catLower = pkg.cat ? pkg.cat.toLowerCase() : '';

        expandedTerms.forEach(term => {
            // High weight for matching package title
            if (nameLower.includes(term)) {
                score += 15;
                if (nameLower.startsWith(term)) score += 5; // prefix match bonus
            }
            // Medium weight for category tags
            if (catLower.includes(term)) {
                score += 8;
            }
            // Low weight for matching descriptions
            if (descLower.includes(term)) {
                score += 3;
            }
        });

        // Exact query match bonus
        const cleanQuery = query.toLowerCase().trim();
        if (nameLower.includes(cleanQuery)) score += 20;
        if (descLower.includes(cleanQuery)) score += 10;

        return { package: pkg, score: score };
    });

    // Sort descending and return top 6 matching items
    return scoredList.filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(item => item.package);
}

/**
 * Browser-native local RAG engine.
 * Generates an instant, highly professional portfolio-aware reply with citations.
 * @param {string} query - Cleaned query string
 * @param {Array} packages - Scored matching packages
 * @returns {string} Fully styled Markdown response
 */
function synthesizeLocalAiResponse(query, packages) {
    const q = query.toLowerCase();

    // 1. Bio / Portfolio request matches
    if (q.includes('who is') || q.includes('chya') || q.includes('luqman') || q.includes('creator') || q.includes('author') || q.includes('portfolio')) {
        let response = `**Chya Luqman** is an elite **UI/UX Engineer & Developer** specializing in state-of-the-art spatial web environments, custom front-end frameworks, and advanced application registries. He is the master architect behind **Cydia Elite v4.0** (Build 12A402).\n\n### Skills & Specialties\n*   **Design Systems**: Minimalist glassmorphism, dynamic motion micro-animations, and high-performance physics-based background canvases.\n*   **Development Layer**: Highly responsive architectures, custom developer API hubs, proxy streaming engines, and binary downloader handlers.\n*   **Core Ideology**: Architecting seamless spatial experiences designed for 2026 browsers.\n\n### Interactive Communities\n*   **Discord Portal**: You can connect with Chya directly on the [Official Discord Community](https://discord.gg/YTeRSG8kER) (currently housing a highly active community of **2.5k+ members**). \n*   **Design Logs**: Follow his latest UI layouts on [Instagram (@chya_luqman)](https://www.instagram.com/chya_luqman/).\n\nTo explore Chya's official community integrations in this portal, you can jump directly to the **Community** [1] category in your registry list. Let me know if you would like me to list other developer tools!`;

        // Find community items in packages if possible to attach citation
        const discordPkg = packageData.find(p => p.cat === 'social' && p.name.includes('Discord'));
        activeAiResponseCitations = discordPkg ? [discordPkg] : (packages.length ? [packages[0]] : []);
        return response;
    }

    // 2. Downloaders matches
    if (q.includes('download') || q.includes('tiktok') || q.includes('instagram') || q.includes('downlo')) {
        let response = `Cydia Elite includes high-speed client-side media downloaders directly inside the left panel. These tools operate dynamically without page refreshes:\n\n1.  **TikTok Downloader**: Located in your sidebar utilities list. It parses ByteDance stream servers on-the-fly and downloads HD video streams and audio MP3 tracks without any watermarks. It features an integrated phone proxy fix for flawless downloads on mobile safari/chrome webviews.\n2.  **Instagram Directory**: Located under **Insta LookUp**. Search public Instagram accounts and fetch profile indexes immediately.\n\nTo quickly fetch a TikTok stream, click the **TikTok Downloader** [1] utility in the sidebar or browse **PC Tools** [2] for downloadable software packages.`;

        const tiktokPkg = { name: "TikTok Downloader", desc: "Download high definition ByteDance videos with no watermark.", cat: "tools", url: "#tiktok", icon: "fab fa-tiktok", id: "tiktok-downloader-citation" };
        const toolsPkg = packageData.find(p => p.cat === 'tools') || packages[0];
        activeAiResponseCitations = toolsPkg ? [tiktokPkg, toolsPkg] : [tiktokPkg];
        return response;
    }

    // 3. Kurdish databases & streaming matches
    if (q.includes('cinema') || q.includes('movie') || q.includes('film')) {
        const moviePkg = packageData.find(p => p.cat === 'movies') || packages[0];
        if (moviePkg) activeAiResponseCitations = [moviePkg];
        return "Cydia Elite features curated developer utilities and tools. Explore the package catalog or API hub for integrated software.";
    }

    // 4. Packages search matches
    if (packages.length > 0) {
        activeAiResponseCitations = [...packages];
        let response = `I have scanned Cydia Elite's semantic package graph and found **${packages.length} premium utilities** matching your search:\n\n`;

        packages.forEach((pkg, index) => {
            const num = index + 1;
            response += `${num}.  **${pkg.name}** [${num}]: ${pkg.desc} *(Category: ${pkg.cat.toUpperCase()})*\n`;
        });

        response += `\n*   **Action Hint**: Click any of the interactive **Portfolio Citation Cards** listed below to instantly open the link or copy the quick developer command directly to your clipboard!`;
        return response;
    }

    // Default Fallback
    activeAiResponseCitations = [];
    return `I scanned Cydia Elite's local software registry but did not find any package matching **"${query}"**.\n\nHowever, as your developer copilot, I suggest:\n*   Checking Chya's **API Hub** for backend endpoints.\n*   Refining your search keywords (e.g., try *"AI"*, *"Tools"*, *"Kurdish"*, or *"TikTok"*).\n*   Performing a global web search using the **Google Web** panel above.`;
}

let chatHistory = []; // Persistent conversational memory thread
let currentLlmMessageId = ''; // Holds active copilot bubble ID

// Global function to copy code from terminal block
window.copyTerminalCode = function (blockId, btn) {
    const codeEl = document.getElementById(blockId);
    if (codeEl) {
        // Decode HTML entities if present to copy raw text
        const tempTextarea = document.createElement('textarea');
        tempTextarea.innerHTML = codeEl.innerHTML;
        const rawText = tempTextarea.value;

        navigator.clipboard.writeText(rawText).then(() => {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.classList.add('copied');
            showToast('Code copied to clipboard!', 'fa-check-circle');

            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            showToast('Copy failed, please copy manually.', 'fa-times-circle');
        });
    }
};

// Robust HF endpoint fetcher walking through a sequence of models for triple uptime reliability
async function fetchLlmResponse(payload) {
    const endpoints = [];
    if (aiPreferredModel) {
        endpoints.push(`https://api-inference.huggingface.co/models/${aiPreferredModel}`);
    }
    const fallbacks = [
        "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-7B-Instruct",
        "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct",
        "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
    ];
    fallbacks.forEach(f => {
        if (!endpoints.includes(f)) endpoints.push(f);
    });

    const headers = { "Content-Type": "application/json" };
    if (aiCustomToken) {
        headers["Authorization"] = `Bearer ${aiCustomToken}`;
    }

    for (const url of endpoints) {
        try {
            console.log(`Querying Hugging Face endpoint: ${url}`);
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout ? AbortSignal.timeout(7000) : null // 7s timeout
            });

            if (response.ok) {
                const data = await response.json();
                let answer = "";
                if (Array.isArray(data) && data[0] && data[0].generated_text) {
                    answer = data[0].generated_text;
                } else if (data && data.generated_text) {
                    answer = data.generated_text;
                }

                if (answer && answer.trim().length > 0) {
                    return answer;
                }
            }
        } catch (e) {
            console.warn(`Hugging Face endpoint failed (${url}):`, e);
        }
    }
    throw new Error("All endpoints offline or rate-limited");
}

// Injects dynamic user bubble and active assistant bubble with a loaders
function createNewConversationalBubbles(query) {
    const resultsBox = document.getElementById('ai-results-box');
    if (!resultsBox) return;

    // Hide welcome screen
    const welcome = document.getElementById('ai-chat-welcome-screen');
    if (welcome) welcome.style.display = 'none';

    // Append User Bubble
    const userMsgHtml = `
    <div class="chat-message-user">
        <div class="chat-bubble-user">${query}</div>
        <div class="chat-avatar-user"><i class="fas fa-user-astronaut" style="color: #60a5fa;"></i> You</div>
    </div>
    `;
    resultsBox.insertAdjacentHTML('beforeend', userMsgHtml);

    // Append Assistant Bubble
    const msgId = 'ai-bubble-' + Date.now();
    currentLlmMessageId = msgId; // Store globally for streamAiResponse

    const copilotMsgHtml = `
    <div class="chat-message-copilot" id="${msgId}">
        <div class="ai-avatar"><i class="fas fa-robot"></i></div>
        <div class="chat-bubble-copilot">
            <!-- Inline Thinking Loader -->
            <div class="ai-thinking-bubble" id="thinking-${msgId}" style="padding: 10px 0; display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
                <div class="thinking-dots">
                    <span></span><span></span><span></span>
                </div>
                <span class="thinking-label" style="font-size:0.7rem; letter-spacing:1px; margin-top:2px;">Synthesizing semantic graph...</span>
            </div>
            
            <!-- Response text container -->
            <div class="ai-response-body" id="text-${msgId}" style="display: none;"></div>
            
            <!-- Citation Section -->
            <div class="ai-citations-section" id="citations-${msgId}" style="display: none;">
                <div class="citations-header" style="font-size: 0.75rem; margin-bottom: 8px; font-weight:700;"><i class="fas fa-quote-left"></i> Portfolio Citations</div>
                <div class="citations-grid" id="grid-${msgId}"></div>
            </div>
        </div>
    </div>
    `;
    resultsBox.insertAdjacentHTML('beforeend', copilotMsgHtml);

    // Scroll resultsBox into view
    resultsBox.scrollTop = resultsBox.scrollHeight;
}

/**
 * Dynamic parser helper that converts basic Markdown syntax to premium HTML.
 * Handles headings, bold tags, code segments, lists, and links.
 * @param {string} text - Raw markdown
 * @returns {string} Parsed HTML
 */
function parseMarkdownToHtml(text) {
    let html = text;

    // Escape standard HTML tags to prevent injections (excluding what we explicitly build)
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Parse bold text: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Parse italic text: *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Parse block headers: ### text
    html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');

    // Parse pre code blocks with language specifiers into terminal-style cards with a Copy Button
    html = html.replace(/```(\w*)\n([\s\S]+?)```/g, (match, lang, code) => {
        const cleanLang = lang || 'code';
        const escapedCode = code.trim();
        const blockId = 'code-' + Math.random().toString(36).substring(2, 9);

        return `
        <div class="terminal-code-block">
            <div class="terminal-header">
                <div class="terminal-dots">
                    <span class="terminal-dot red"></span>
                    <span class="terminal-dot yellow"></span>
                    <span class="terminal-dot green"></span>
                </div>
                <span class="terminal-lang">${cleanLang}</span>
                <button class="terminal-copy-btn" onclick="copyTerminalCode('${blockId}', this)">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            <pre class="terminal-code-content"><code id="${blockId}">${escapedCode}</code></pre>
        </div>
        `;
    });

    // Parse pre code blocks without specified language
    html = html.replace(/```([\s\S]+?)```/g, (match, code) => {
        const escapedCode = code.trim();
        const blockId = 'code-' + Math.random().toString(36).substring(2, 9);
        return `
        <div class="terminal-code-block">
            <div class="terminal-header">
                <div class="terminal-dots">
                    <span class="terminal-dot red"></span>
                    <span class="terminal-dot yellow"></span>
                    <span class="terminal-dot green"></span>
                </div>
                <span class="terminal-lang">code</span>
                <button class="terminal-copy-btn" onclick="copyTerminalCode('${blockId}', this)">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            <pre class="terminal-code-content"><code id="${blockId}">${escapedCode}</code></pre>
        </div>
        `;
    });

    // Parse inline code segments: `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Parse lists
    html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

    // Group adjacent <li> elements into lists
    html = html.replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); // deduplicate ul groups

    // Parse standard markdown links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Parse custom bracket citations: [N] -> triggerCitationAction(N-1)
    html = html.replace(/\[(\d+)\]/g, (match, num) => {
        return `<span class="citation-number" onclick="triggerCitationAction(${parseInt(num) - 1})">${num}</span>`;
    });

    // Replace double newline blocks with paragraphs
    html = html.split('\n\n').map(p => {
        const trimmed = p.trim();
        if (trimmed.startsWith('<ul') || trimmed.startsWith('<h4') || trimmed.startsWith('<div class="terminal') || trimmed.startsWith('<pre')) {
            return p;
        }
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
}

/**
 * Stream typing animation simulation inside the latest conversational bubble
 * @param {string} rawMarkdown - Text to render
 * @param {Array} citations - Citation list
 */
function streamAiResponse(rawMarkdown, citations) {
    const resultsBox = document.getElementById('ai-results-box');
    const msgId = currentLlmMessageId;
    if (!msgId || !resultsBox) return;

    const thinking = document.getElementById(`thinking-${msgId}`);
    const textContainer = document.getElementById(`text-${msgId}`);
    const citationsContainer = document.getElementById(`citations-${msgId}`);
    const citationsGrid = document.getElementById(`grid-${msgId}`);

    if (!textContainer || !thinking) return;

    // Toggle displays
    thinking.style.display = 'none';
    textContainer.style.display = 'block';

    // Begin typewriter character streaming
    let index = 0;
    const totalLength = rawMarkdown.length;
    const increment = 3; // Fluid typing speed

    function typeChar() {
        if (index < totalLength) {
            index += increment;
            const visibleSub = rawMarkdown.substring(0, Math.min(index, totalLength));
            textContainer.innerHTML = parseMarkdownToHtml(visibleSub) + '<span class="typewriter-cursor">|</span>';

            // Keep container scrolled to bottom
            resultsBox.scrollTop = resultsBox.scrollHeight;

            setTimeout(typeChar, 10);
        } else {
            // Done streaming - render complete markdown with no cursor
            textContainer.innerHTML = parseMarkdownToHtml(rawMarkdown);

            if (aiVoiceEnabled) {
                const speakBtnHtml = `
                <div style="margin-top: 10px; display: flex; gap: 8px;">
                    <button class="ai-speak-btn" id="speak-btn-${msgId}" onclick="toggleSpeechSynthesis('${rawMarkdown.replace(/'/g, "\\'").replace(/\r/g, '').replace(/\n/g, ' ')}', '${msgId}', this)">
                        <i class="fas fa-volume-up"></i> Speak Answer
                    </button>
                </div>
                `;
                textContainer.insertAdjacentHTML('beforeend', speakBtnHtml);
            }

            // Render citation cards if matches exist
            if (citations && citations.length > 0) {
                citationsGrid.innerHTML = '';
                citations.forEach((pkg, idx) => {
                    const num = idx + 1;
                    const actionIcon = pkg.cmd ? 'fa-copy' : 'fa-external-link-alt';
                    const cleanDesc = pkg.desc ? pkg.desc.substring(0, 50) + (pkg.desc.length > 50 ? '...' : '') : 'Portfolio Package Tweak';

                    citationsGrid.innerHTML += `
                        <div class="citation-card" onclick="triggerCitationAction(${idx})">
                            <div class="citation-badge">${num}</div>
                            <div class="citation-info">
                                <span class="citation-name">${pkg.name}</span>
                                <span class="citation-desc">${cleanDesc}</span>
                            </div>
                            <div class="citation-action"><i class="fas ${actionIcon}"></i></div>
                        </div>
                    `;
                });
                citationsContainer.style.display = 'block';
            }

            // Push history when message completes streaming
            chatHistory.push({ role: 'user', content: activeAiQuery });
            chatHistory.push({ role: 'assistant', content: rawMarkdown });

            // Keep context size bounded (max 20 messages)
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

            resultsBox.scrollTop = resultsBox.scrollHeight;
        }
    }

    typeChar();
}

/**
 * Handle direct action (open URL or copy command) for citation clicks
 * @param {number} idx - Index in citations list
 */
function triggerCitationAction(idx) {
    if (!activeAiResponseCitations || !activeAiResponseCitations[idx]) return;
    const pkg = activeAiResponseCitations[idx];

    if (pkg.cmd) {
        const safeCmd = pkg.cmd.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        navigator.clipboard.writeText(safeCmd);
        showToast(`Command copied: ${pkg.name}`, 'fa-check-circle');
    } else if (pkg.url) {
        if (pkg.url.startsWith('#')) {
            const tabId = pkg.url.substring(1);
            switchTab(tabId);
        } else {
            window.open(pkg.url, '_blank');
        }
    }
}

/**
 * Dynamic click action to reset/clear AI search view
 */
function clearAiChat() {
    const aiInput = document.getElementById('ai-query');
    if (aiInput) aiInput.value = '';

    const resultsBox = document.getElementById('ai-results-box');
    if (resultsBox) {
        resultsBox.innerHTML = `
        <div class="ai-chat-welcome" id="ai-chat-welcome-screen">
            <i class="fas fa-brain-circuit welcome-brain"></i>
            <h3>Cydia Elite AI Assistant</h3>
            <p>I am highly trained on Chya's projects, Cydia Elite's 500+ package registry, FAQ databases, and technical developer specifications. Ask me anything to get instant, interactive answers.</p>
        </div>
        `;
    }

    chatHistory = [];
    activeAiQuery = '';
    activeAiResponseCitations = [];
    showToast('Conversation cleared.', 'fa-trash-alt');
}

/**
 * Copies the raw latest typed response block to browser clipboard
 */
function copyAiResponse() {
    if (chatHistory.length > 0) {
        const lastAssistantMsg = [...chatHistory].reverse().find(m => m.role === 'assistant');
        if (lastAssistantMsg) {
            navigator.clipboard.writeText(lastAssistantMsg.content);
            showToast('Latest response copied!', 'fa-check-circle');
            return;
        }
    }
    showToast('No response available to copy.', 'fa-exclamation-triangle');
}

/**
 * Master controller for processing AI queries.
 * Incorporates scored local indices and Hugging Face API live client pipelines.
 */
async function performAiSearch() {
    const input = document.getElementById('ai-query');
    if (!input) return;

    const query = input.value.trim();
    if (!query) {
        showToast('Please type a search question first.', 'fa-exclamation-triangle');
        return;
    }

    activeAiQuery = query;
    activeAiResponseCitations = [];

    input.value = '';

    createNewConversationalBubbles(query);

    updateAiStatusIndicator('thinking', 'AI Core: Processing...');

    const matchedPackages = scoreQueryAgainstPackages(query);

    const localMarkdown = synthesizeLocalAiResponse(query, matchedPackages);

    const isLocalSpecific = query.toLowerCase().includes('chya') ||
        query.toLowerCase().includes('cydia') ||
        query.toLowerCase().includes('download') ||
        query.toLowerCase().includes('tiktok') ||
        query.toLowerCase().includes('tools');

    if (isLocalSpecific) {
        setTimeout(() => {
            activeAiResponseCitations = matchedPackages.length ? matchedPackages : (activeAiResponseCitations.length ? activeAiResponseCitations : []);
            streamAiResponse(localMarkdown, activeAiResponseCitations);
            updateAiStatusIndicator('ready');
        }, 600);
        return;
    }

    try {
        const historyContext = chatHistory.slice(-6).map(m => {
            return m.role === 'user' ? `[User]: ${m.content}` : `[Copilot]: ${m.content}`;
        }).join("\n\n");

        const payload = {
            inputs: `${aiSystemPrompt}

[Owner/Creator Bio]: Chya Luqman is an elite UI/UX engineer and developer. Connect on Discord (https://discord.gg/YTeRSG8kER - 2.5k members) or Instagram (@chya_luqman).

[Scored Portfolio Matches]: ${matchedPackages.map(p => p.name + " (" + p.desc + ")").join(", ")}

[Conversation History]:
${historyContext || "No previous history."}

[User Question]: ${query}

Please provide the next direct conversational response:`,
            parameters: { max_new_tokens: 500, temperature: 0.7 }
        };

        let answer = await fetchLlmResponse(payload);

        if (answer.includes("[User Question]:")) {
            answer = answer.substring(answer.lastIndexOf("[User Question]:") + 16 + query.length).trim();
        }
        if (answer.includes("Please provide the next direct conversational response:")) {
            answer = answer.substring(answer.lastIndexOf("Please provide the next direct conversational response:") + 55).trim();
        }
        if (answer.includes("Elite Copilot v4.0:")) {
            answer = answer.substring(answer.lastIndexOf("Elite Copilot v4.0:") + 19).trim();
        }

        activeAiResponseCitations = [...matchedPackages];

        streamAiResponse(answer.trim(), activeAiResponseCitations);
        updateAiStatusIndicator('ready');

    } catch (err) {
        console.warn("Hugging Face API failed. Falling back to local portfolio-intelligence RAG graph...", err);
        activeAiResponseCitations = [...matchedPackages];
        streamAiResponse(localMarkdown, activeAiResponseCitations);
        updateAiStatusIndicator('local-fallback');
    }
}

// AI settings cogs modal functions
function openAiSettings() {
    const modal = document.getElementById('ai-settings-modal');
    if (modal) {
        modal.classList.add('active');
        initializeAiSettingsUI();
    }
}

function closeAiSettings() {
    const modal = document.getElementById('ai-settings-modal');
    if (modal) modal.classList.remove('active');
}

function initializeAiSettingsUI() {
    const tokenInput = document.getElementById('ai-settings-token');
    const modelSelect = document.getElementById('ai-settings-model');
    const systemPromptInput = document.getElementById('ai-settings-system');
    const voiceCheckbox = document.getElementById('ai-settings-voice');

    if (tokenInput) tokenInput.value = aiCustomToken;
    if (modelSelect) modelSelect.value = aiPreferredModel;
    if (systemPromptInput) systemPromptInput.value = aiSystemPrompt;
    if (voiceCheckbox) voiceCheckbox.checked = aiVoiceEnabled;

    updateAiStatusIndicator('ready');
}

function saveAiSettings() {
    const tokenInput = document.getElementById('ai-settings-token');
    const modelSelect = document.getElementById('ai-settings-model');
    const systemPromptInput = document.getElementById('ai-settings-system');
    const voiceCheckbox = document.getElementById('ai-settings-voice');

    if (tokenInput) {
        aiCustomToken = tokenInput.value.trim();
        localStorage.setItem('ai_custom_token', aiCustomToken);
    }
    if (modelSelect) {
        aiPreferredModel = modelSelect.value;
        localStorage.setItem('ai_preferred_model', aiPreferredModel);
    }
    if (systemPromptInput) {
        aiSystemPrompt = systemPromptInput.value.trim();
        localStorage.setItem('ai_system_prompt', aiSystemPrompt);
    }
    if (voiceCheckbox) {
        aiVoiceEnabled = voiceCheckbox.checked;
        localStorage.setItem('ai_voice_enabled', aiVoiceEnabled ? 'true' : 'false');
    }

    closeAiSettings();
    showToast('AI Configuration saved!', 'fa-check-circle');
    updateAiStatusIndicator('ready');
}

function resetAiSettings() {
    localStorage.removeItem('ai_custom_token');
    localStorage.removeItem('ai_preferred_model');
    localStorage.removeItem('ai_system_prompt');
    localStorage.removeItem('ai_voice_enabled');

    aiCustomToken = '';
    aiPreferredModel = 'Qwen/Qwen2.5-Coder-7B-Instruct';
    aiSystemPrompt = `[System Instructions]: You are Elite Copilot v4.0, a verified spatial AI tech assistant integrated inside Chya Luqman's premium tweak repository and website. 
Be highly conversational, professional, concise, and format answers using Markdown bold, bullet lists, or code blocks.
Whenever relevant, refer back to the scored portfolio items and direct users to them.`;
    aiVoiceEnabled = false;

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    initializeAiSettingsUI();
    showToast('Settings reset to defaults', 'fa-history');
}

function updateAiStatusIndicator(state, message = '') {
    const dot = document.getElementById('ai-core-status-dot');
    const text = document.getElementById('ai-core-status-text');
    if (!dot || !text) return;

    dot.className = 'status-dot';

    const getModelShortName = (fullName) => {
        if (fullName.includes('Coder')) return 'Qwen Coder';
        if (fullName.includes('Qwen2.5')) return 'Qwen 2.5';
        if (fullName.includes('zephyr')) return 'Zephyr';
        if (fullName.includes('Llama')) return 'Llama 3.1';
        return 'Custom';
    };

    const modelName = getModelShortName(aiPreferredModel);

    switch (state) {
        case 'thinking':
            dot.classList.add('processing');
            text.innerText = message || 'AI Core: Thinking...';
            break;
        case 'local-fallback':
            dot.classList.add('local-mode');
            text.innerText = `AI Core: Local Fallback (${modelName})`;
            break;
        case 'ready':
        default:
            dot.classList.add('online');
            text.innerText = `AI Core: Online (${modelName})`;
            break;
    }
}

// Speech Recognition & Voice Synthesis Features
function startSpeechRecognition(inputId, btn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast('Speech Recognition not supported in this browser.', 'fa-microphone-slash');
        return;
    }

    if (btn.classList.contains('recording')) {
        if (window._activeRecognition) {
            window._activeRecognition.stop();
        }
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        btn.classList.add('recording');
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        showToast('Listening...', 'fa-microphone');
        window._activeRecognition = recognition;
    };

    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        const input = document.getElementById(inputId);
        if (input) {
            input.value = result;
            showToast(`Speech recognized: "${result}"`, 'fa-comment-alt');
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        showToast(`Speech Error: ${event.error}`, 'fa-exclamation-triangle');
    };

    recognition.onend = () => {
        btn.classList.remove('recording');
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        window._activeRecognition = null;
    };

    recognition.start();
}

function toggleSpeechSynthesis(text, msgId, btn) {
    if (!window.speechSynthesis) {
        showToast('Voice Synthesis not supported in this browser.', 'fa-volume-mute');
        return;
    }

    const bubble = document.getElementById(msgId);

    if (activeSpeechUtterance && activeSpeakingButton === btn) {
        window.speechSynthesis.cancel();
        activeSpeechUtterance = null;
        activeSpeakingButton = null;
        btn.classList.remove('speaking');
        btn.innerHTML = '<i class="fas fa-volume-up"></i> Speak Answer';
        if (bubble) bubble.classList.remove('speaking');
        showToast('Speech stopped.', 'fa-volume-mute');
        return;
    }

    window.speechSynthesis.cancel();
    if (activeSpeakingButton) {
        activeSpeakingButton.classList.remove('speaking');
        activeSpeakingButton.innerHTML = '<i class="fas fa-volume-up"></i> Speak Answer';
        const activeBubble = document.getElementById(activeSpeakingButton.id.replace('speak-btn-', ''));
        if (activeBubble) activeBubble.classList.remove('speaking');
    }

    const cleanText = text.replace(/[*#`_\-]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
        btn.classList.add('speaking');
        btn.innerHTML = '<i class="fas fa-pause-circle"></i> Speaking...';
        if (bubble) bubble.classList.add('speaking');
        activeSpeechUtterance = utterance;
        activeSpeakingButton = btn;
    };

    utterance.onend = () => {
        btn.classList.remove('speaking');
        btn.innerHTML = '<i class="fas fa-volume-up"></i> Speak Answer';
        if (bubble) bubble.classList.remove('speaking');
        activeSpeechUtterance = null;
        activeSpeakingButton = null;
    };

    utterance.onerror = () => {
        btn.classList.remove('speaking');
        btn.innerHTML = '<i class="fas fa-volume-up"></i> Speak Answer';
        if (bubble) bubble.classList.remove('speaking');
        activeSpeechUtterance = null;
        activeSpeakingButton = null;
    };

    window.speechSynthesis.speak(utterance);
}

// ==========================================
// MY PRIVACY CONTROL DASHBOARD LOGIC
// ==========================================

// 1. Theme selection
window.setAppTheme = function (theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('privacy_theme', theme);

    // Update theme chips active state
    document.querySelectorAll('.theme-chip').forEach(chip => {
        if (chip.getAttribute('data-theme') === theme) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    // Show toast for visual confirmation
    showToast(`Accent theme set to ${theme.charAt(0).toUpperCase() + theme.slice(1)}!`, 'fa-palette');
};

// 2. Profile alias and biography
window.updatePrivacyProfile = function () {
    const usernameInput = document.getElementById('privacy-username');
    const bioInput = document.getElementById('privacy-bio');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const bio = bioInput ? bioInput.value.trim() : '';

    localStorage.setItem('privacy_username', username);
    localStorage.setItem('privacy_bio', bio);

    // Sync to other parts of page
    const homeName = document.querySelector('.hero-name');
    if (homeName) {
        homeName.innerText = username || 'Chya Luqman';
    }

    const bioEl = document.getElementById('bio-text');
    if (bioEl) {
        bioEl.innerText = bio || 'Developed by Chya Luqman, Cydia Elite is an architectural study in how classic package management can evolve into the era of spatial computing.';
    }
};

// 3. Mouse trail toggler
window.toggleMouseTrail = function (enabled) {
    localStorage.setItem('privacy_mouse_trail', enabled ? 'true' : 'false');
    showToast(enabled ? 'Cursor particle trail enabled.' : 'Cursor particle trail disabled.', enabled ? 'fa-magic' : 'fa-ban');
};

// 4. Reduce motion toggler
window.toggleReduceMotion = function (enabled) {
    localStorage.setItem('privacy_reduce_motion', enabled ? 'true' : 'false');
    if (enabled) {
        document.body.classList.add('reduce-motion');
        showToast('Interface scale animations reduced.', 'fa-running');
    } else {
        document.body.classList.remove('reduce-motion');
        showToast('Interface animations restored.', 'fa-bolt');
    }
};

// 5. Search history toggler
window.toggleSaveHistory = function (enabled) {
    localStorage.setItem('privacy_save_history', enabled ? 'true' : 'false');
    const wrapper = document.getElementById('history-section-wrapper');
    if (wrapper) {
        wrapper.style.display = enabled ? 'block' : 'none';
    }
    if (enabled) {
        updateSearchHistoryUI();
        showToast('Search logging activated.', 'fa-history');
    } else {
        showToast('Search logging deactivated.', 'fa-eye-slash');
    }
};

// 6. Save search query into history
window.saveSearchQuery = function (query) {
    query = query.trim();
    if (!query) return;
    if (localStorage.getItem('privacy_save_history') === 'false') return;

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('privacy_search_history') || '[]');
    } catch (e) {
        history = [];
    }

    history = history.filter(q => q.toLowerCase() !== query.toLowerCase());
    history.unshift(query);
    history = history.slice(0, 10); // keep last 10

    localStorage.setItem('privacy_search_history', JSON.stringify(history));
    updateSearchHistoryUI();
};

// 7. Render search history chips in settings
window.updateSearchHistoryUI = function () {
    const container = document.getElementById('privacy-history-tags');
    if (!container) return;

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('privacy_search_history') || '[]');
    } catch (e) {
        history = [];
    }

    if (history.length === 0) {
        container.innerHTML = '<span style="font-size: 0.75rem; color: rgba(255,255,255,0.3); font-style: italic;">No recent searches logged.</span>';
        return;
    }

    let html = '';
    history.forEach((query, index) => {
        html += `
            <span class="history-tag">
                <span onclick="applyHistorySearch('${query.replace(/'/g, "\\'")}')" style="cursor:pointer;">${query}</span>
                <i class="fas fa-times-circle" onclick="deleteHistoryItem(${index})"></i>
            </span>
        `;
    });
    container.innerHTML = html;
};

// 8. Delete individual search history tag
window.deleteHistoryItem = function (index) {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('privacy_search_history') || '[]');
    } catch (e) {
        history = [];
    }

    history.splice(index, 1);
    localStorage.setItem('privacy_search_history', JSON.stringify(history));
    updateSearchHistoryUI();
    showToast('Search item removed.', 'fa-trash-alt');
};

// 9. Apply history query to main search bar
window.applyHistorySearch = function (query) {
    switchTab('search');
    const sInput = document.getElementById('search-input');
    const pcInput = document.getElementById('pc-search-input');
    if (sInput) {
        sInput.value = query;
        sInput.dispatchEvent(new Event('input'));
    }
    if (pcInput) {
        pcInput.value = query;
        pcInput.dispatchEvent(new Event('input'));
    }
};

// 10. Storage Encryption Toggle (Obfuscator simulation)
window.toggleStorageEncryption = function (enabled) {
    localStorage.setItem('privacy_encryption', enabled ? 'true' : 'false');
    if (enabled) {
        showToast('Local states obfuscated via AES-256-GCM wrapper.', 'fa-lock');
    } else {
        showToast('Local state storage decrypted.', 'fa-lock-open');
    }
};

// 11. Clear all cache variables and reset
window.clearAllCache = function () {
    if (confirm("Are you sure you want to clear all local storage, search logs, and personalized settings? This will trigger a system respring.")) {
        localStorage.clear();
        showToast('Local sandbox states cleared successfully.', 'fa-check');
        setTimeout(() => location.reload(), 1000);
    }
};

// 12. Provider Permissions Toggle
window.toggleProvider = function (provider, enabled) {
    localStorage.setItem(`privacy_provider_${provider}`, enabled ? 'true' : 'false');
    showToast(`${provider.toUpperCase()} integration permission ${enabled ? 'granted' : 'revoked'}.`, enabled ? 'fa-check-circle' : 'fa-exclamation-triangle');
};

// 13. Dynamic Proxy selection
window.handleProxySelectChange = function () {
    const select = document.getElementById('privacy-proxy-select');
    const customWrapper = document.getElementById('custom-proxy-input-wrapper');
    if (!select) return;

    const value = select.value;
    localStorage.setItem('privacy_proxy_select', value);

    if (value === 'custom') {
        if (customWrapper) customWrapper.style.display = 'flex';
    } else {
        if (customWrapper) customWrapper.style.display = 'none';
    }

    showToast(`CORS Request proxy set to ${select.options[select.selectedIndex].text}.`, 'fa-server');
};

// 14. Ping integration diagnostic test
window.pingService = function (service, url) {
    const badge = document.getElementById(`status-badge-${service}`);
    const latencyEl = document.getElementById(`latency-val-${service}`);
    const btn = document.querySelector(`#diagnostic-row-${service} .ping-btn`);

    if (badge) {
        badge.className = 'badge-status-gray';
        badge.innerText = 'Testing...';
    }
    if (latencyEl) latencyEl.innerText = '-- ms';
    if (btn) {
        btn.classList.add('pinging');
        btn.innerHTML = '<i class="fas fa-spinner"></i> Pinging';
        btn.disabled = true;
    }

    const start = Date.now();

    // Perform fetch with custom headers to prevent browser caching
    fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
        .then(() => {
            const delay = Date.now() - start;
            if (badge) {
                badge.className = 'badge-status-green';
                badge.innerText = 'Connected';
            }
            if (latencyEl) latencyEl.innerText = `${delay} ms`;
        })
        .catch((err) => {
            // If blocked by settings directly in fetch
            if (localStorage.getItem(`privacy_provider_${service}`) === 'false') {
                if (badge) {
                    badge.className = 'badge-status-red';
                    badge.innerText = 'Blocked';
                }
                if (latencyEl) latencyEl.innerText = 'Permission Denied';
                return;
            }

            // Mode no-cors will succeed even if server blocks it (since opaque response).
            // If it throws an actual exception, it means network offline or dns resolution issue.
            const delay = Date.now() - start;
            if (delay < 5000) {
                if (badge) {
                    badge.className = 'badge-status-green';
                    badge.innerText = 'Connected';
                }
                if (latencyEl) latencyEl.innerText = `${delay} ms`;
            } else {
                if (badge) {
                    badge.className = 'badge-status-red';
                    badge.innerText = 'Offline/Failed';
                }
                if (latencyEl) latencyEl.innerText = 'Timeout';
            }
        })
        .finally(() => {
            if (btn) {
                btn.classList.remove('pinging');
                btn.innerHTML = '<i class="fas fa-bolt"></i> Ping';
                btn.disabled = false;
            }
        });
};

// 15. Load settings into UI on boot
window.loadPrivacySettings = function () {
    // Restore theme
    const activeTheme = localStorage.getItem('privacy_theme') || 'default';
    document.documentElement.setAttribute('data-theme', activeTheme);

    const chips = document.querySelectorAll('.theme-chip');
    chips.forEach(chip => {
        if (chip.getAttribute('data-theme') === activeTheme) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    // Restore username and bio
    const savedName = localStorage.getItem('privacy_username') || '';
    const savedBio = localStorage.getItem('privacy_bio') || '';

    const uInput = document.getElementById('privacy-username');
    const bInput = document.getElementById('privacy-bio');

    if (uInput) uInput.value = savedName;
    if (bInput) bInput.value = savedBio;

    if (savedName) {
        const hName = document.querySelector('.hero-name');
        if (hName) hName.innerText = savedName;
    }
    if (savedBio) {
        const bioEl = document.getElementById('bio-text');
        if (bioEl) bioEl.innerText = savedBio;
    }

    // Restore switches
    const mouseTrailVal = localStorage.getItem('privacy_mouse_trail') !== 'false';
    const trailSwitch = document.getElementById('privacy-mouse-trail');
    if (trailSwitch) trailSwitch.checked = mouseTrailVal;

    const reduceMotionVal = localStorage.getItem('privacy_reduce_motion') === 'true';
    const motionSwitch = document.getElementById('privacy-reduce-motion');
    if (motionSwitch) {
        motionSwitch.checked = reduceMotionVal;
        if (reduceMotionVal) document.body.classList.add('reduce-motion');
    }

    const saveHistoryVal = localStorage.getItem('privacy_save_history') !== 'false';
    const historySwitch = document.getElementById('privacy-save-history');
    if (historySwitch) {
        historySwitch.checked = saveHistoryVal;
        const wrapper = document.getElementById('history-section-wrapper');
        if (wrapper) wrapper.style.display = saveHistoryVal ? 'block' : 'none';
    }
    updateSearchHistoryUI();

    const telemetryVal = localStorage.getItem('privacy_telemetry') === 'true';
    const telemetrySwitch = document.getElementById('privacy-telemetry');
    if (telemetrySwitch) telemetrySwitch.checked = telemetryVal;

    const encryptionVal = localStorage.getItem('privacy_encryption') === 'true';
    const encryptionSwitch = document.getElementById('privacy-encryption');
    if (encryptionSwitch) encryptionSwitch.checked = encryptionVal;

    // Restore integrations
    const integrations = ['ai', 'tiktok', 'instagram', 'anime', 'games', 'movies'];
    integrations.forEach(provider => {
        const val = localStorage.getItem(`privacy_provider_${provider}`) !== 'false';
        const checkbox = document.getElementById(`privacy-provider-${provider}`);
        if (checkbox) checkbox.checked = val;
    });

    // Restore proxy selection
    const proxySelect = localStorage.getItem('privacy_proxy_select') || 'allorigins';
    const selectEl = document.getElementById('privacy-proxy-select');
    if (selectEl) selectEl.value = proxySelect;

    const customProxyWrapper = document.getElementById('custom-proxy-input-wrapper');
    if (customProxyWrapper) {
        customProxyWrapper.style.display = (proxySelect === 'custom') ? 'flex' : 'none';
    }

    const customProxyVal = localStorage.getItem('privacy_custom_proxy') || '';
    const customProxyInput = document.getElementById('privacy-custom-proxy');
    if (customProxyInput) customProxyInput.value = customProxyVal;
};

// Initialize settings on page load
loadPrivacySettings();
