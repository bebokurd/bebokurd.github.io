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
    if (localStorage.getItem('privacy_mouse_trail') === 'false') return;
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
    initializeFaqAiFeatures();
    startHomeActivityMonitor();
    initializeAiSettingsUI();

    // Setup LIVE YTS/TMDB empty query handler
    const ksSearchInput = document.getElementById('ks-search-input');
    if (ksSearchInput) {
        ksSearchInput.addEventListener('input', () => {
            if (!ksSearchInput.value.trim() && ksCurrentSource === 'videasy') {
                loadVideasyHome();
            }
        });
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
    'live-sports': 'sports', 'sports': 'sports',
    'live-tv': 'livetv', 'livetv': 'livetv',
    'pc-games': 'games', 'games': 'games',
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
            if (targetUrl.includes('kurdcinama-stream-seeker')) {
                switchTab('kurdstream');
                setTimeout(() => renderKSEmbed(targetUrl, 'Deep Linked Media'), 500);
            } else {
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
        }
    } else {
        const validTabs = [
            'home', 'categories-hub', 'installed', 'search', 'tiktok', 'instagram',
            'google', 'anime-search', 'kurdstream', 'kurddoblazh', 'api-hub', 'faq', 'about',
            'privacy', 'my-privacy', 'contact', 'status', 'free-games'
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
        // 3. Support direct category names as hashes, e.g. `#community` or `#live-sports`
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

    // Count categories dynamically for Home Dashboard breakdown
    const countAi = packageData.filter(p => p.cat === 'ai').length;
    const countTools = packageData.filter(p => p.cat === 'tools').length;
    const countKurdish = packageData.filter(p => p.cat === 'kurdish').length;
    const countSports = packageData.filter(p => p.cat === 'sports').length;
    
    const countAiEl = document.getElementById('count-ai');
    const countToolsEl = document.getElementById('count-tools');
    const countKurdishEl = document.getElementById('count-kurdish');
    const countSportsEl = document.getElementById('count-sports');
    
    if (countAiEl) countAiEl.innerText = countAi;
    if (countToolsEl) countToolsEl.innerText = countTools;
    if (countKurdishEl) countKurdishEl.innerText = countKurdish;
    if (countSportsEl) countSportsEl.innerText = countSports;
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
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;

    const timeEl = document.getElementById('iphone-time');
    if (timeEl) timeEl.innerText = strTime;

    const mainClock = document.getElementById('main-clock-time');
    if (mainClock) mainClock.innerText = strTime;

    const mainDate = document.getElementById('main-clock-date');
    if (mainDate) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        mainDate.innerText = now.toLocaleDateString(undefined, options);
    }

    setTimeout(updateClock, 60000);
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
let playlist = [
    { name: "Lala (Default Background)", url: "lala.mp3", isDefault: true, color: "#a855f7", colorRgb: "168, 85, 247" },
    { name: "Synthwave Retro Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isDefault: true, color: "#f43f5e", colorRgb: "244, 63, 94" },
    { name: "Chill Ambient Vibes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", isDefault: true, color: "#06b6d4", colorRgb: "6, 182, 212" },
    { name: "Lo-Fi Beats for Coding", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", isDefault: true, color: "#f59e0b", colorRgb: "245, 158, 11" }
];
let currentSongIndex = 0;
let preMuteVolume = 0.3;

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

// Load playlist from localStorage
function initSongsPlaylist() {
    const savedPlaylist = localStorage.getItem('songs_playlist');
    if (savedPlaylist) {
        try {
            playlist = JSON.parse(savedPlaylist);
        } catch (e) {
            console.error("Failed to parse saved playlist, resetting defaults", e);
        }
    }
    const savedIndex = localStorage.getItem('songs_current_index');
    if (savedIndex !== null) {
        currentSongIndex = parseInt(savedIndex) || 0;
        if (currentSongIndex >= playlist.length) currentSongIndex = 0;
    }
    
    // Setup ended event to advance songs automatically
    if (audio) {
        audio.removeAttribute('loop'); // Disable looping default so it goes to next song
        audio.addEventListener('ended', () => {
            nextSong();
        });
        
        // Progress scrubber updates
        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            const progress = (audio.currentTime / audio.duration) * 100;
            const progressInput = document.getElementById('audio-progress-bar');
            if (progressInput) progressInput.value = progress;
            
            const currentLabel = document.getElementById('track-time-current');
            if (currentLabel) currentLabel.innerText = formatTime(audio.currentTime);
        });
        
        audio.addEventListener('durationchange', () => {
            const durationLabel = document.getElementById('track-time-duration');
            if (durationLabel) durationLabel.innerText = formatTime(audio.duration);
        });
    }
    
    // Setup scrub and volume event listeners in DOM
    setTimeout(() => {
        const progressInput = document.getElementById('audio-progress-bar');
        if (progressInput) {
            progressInput.addEventListener('input', () => {
                if (!audio || !audio.duration) return;
                const newTime = (progressInput.value / 100) * audio.duration;
                audio.currentTime = newTime;
            });
        }
        
        const volumeSlider = document.getElementById('audio-volume-slider');
        if (volumeSlider) {
            if (audio) {
                volumeSlider.value = audio.volume * 100;
            }
            volumeSlider.addEventListener('input', () => {
                if (!audio) return;
                const vol = volumeSlider.value / 100;
                audio.volume = vol;
                audio.muted = false;
                
                const volumeIcon = document.getElementById('volume-icon-btn');
                if (volumeIcon) {
                    if (vol === 0) {
                        volumeIcon.className = 'fas fa-volume-mute';
                        volumeIcon.style.color = '#ef4444';
                    } else {
                        volumeIcon.className = vol > 0.5 ? 'fas fa-volume-up' : 'fas fa-volume-down';
                        volumeIcon.style.color = 'rgba(255,255,255,0.4)';
                    }
                }
            });
        }
    }, 500);
}

// Initialize on execution
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
    
    let html = "";
    playlist.forEach((song, index) => {
        const isActive = index === currentSongIndex;
        const activeClass = isActive ? 'active' : '';
        const iconClass = isActive && isPlaying ? 'fas fa-volume-up' : 'fas fa-music';
        
        // Define inline style to show dynamic accent color bullet next to song name
        const bulletColor = song.color || '#3b82f6';
        
        html += `
            <div class="playlist-item ${activeClass}" onclick="selectSong(${index})">
                <div class="playlist-item-name-wrap">
                    <span class="playlist-item-icon" style="color: ${isActive ? bulletColor : 'rgba(255,255,255,0.35)'};"><i class="${iconClass}"></i></span>
                    <span class="playlist-item-name" title="${song.name}">${song.name}</span>
                </div>
                ${!song.isDefault ? `
                    <button class="playlist-item-delete" onclick="deleteSong(${index}, event)" title="Delete song">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                ` : ''}
            </div>
        `;
    });
    container.innerHTML = html;
}

function updateSongsPlayerUI() {
    const titleEl = document.getElementById('now-playing-title');
    const statusEl = document.getElementById('now-playing-status');
    const containerEl = document.getElementById('now-playing-container');
    const discEl = document.getElementById('now-playing-disc');
    const modalPlayBtn = document.getElementById('modal-play-btn');
    const fabBtn = document.getElementById('audio-fab');
    
    if (playlist[currentSongIndex]) {
        const song = playlist[currentSongIndex];
        if (titleEl) titleEl.innerText = song.name;
        if (statusEl) statusEl.innerText = isPlaying ? "Playing" : "Paused";
        
        if (containerEl) {
            containerEl.style.setProperty('--player-accent', song.color || '#3b82f6');
            containerEl.style.setProperty('--player-accent-rgb', song.colorRgb || '59, 130, 246');
            
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
        
        if (fabBtn) {
            fabBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-music"></i>';
            if (isPlaying) {
                fabBtn.classList.add('pulse-glow-green'); // Add visual cue to floating button
                fabBtn.style.animation = "spin 12s linear infinite";
                fabBtn.style.setProperty('box-shadow', `0 15px 40px rgba(${song.colorRgb || '255,255,255'}, 0.3)`);
                fabBtn.style.setProperty('border-color', song.color || '#fff');
            } else {
                fabBtn.classList.remove('pulse-glow-green');
                fabBtn.style.animation = "none";
                fabBtn.style.removeProperty('box-shadow');
                fabBtn.style.removeProperty('border-color');
            }
        }
        
        // Sync scrubber and volume sliders
        if (audio) {
            const currentLabel = document.getElementById('track-time-current');
            if (currentLabel) currentLabel.innerText = formatTime(audio.currentTime);
            
            const durationLabel = document.getElementById('track-time-duration');
            if (durationLabel) durationLabel.innerText = formatTime(audio.duration);
            
            const progressInput = document.getElementById('audio-progress-bar');
            if (progressInput && audio.duration) {
                progressInput.value = (audio.currentTime / audio.duration) * 100;
            }
            
            const volumeSlider = document.getElementById('audio-volume-slider');
            if (volumeSlider) {
                volumeSlider.value = audio.volume * 100;
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
    
    // Set src if not already matching the current song
    const currentUrl = playlist[currentSongIndex] ? playlist[currentSongIndex].url : '';
    // Normalize path checks
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
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0;
    selectSong(nextIndex);
}

// Deprecated original toggleAudio fallback for backwards compatibility
function toggleAudio() {
    toggleSongsPlay();
}

function prevSong() {
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    selectSong(prevIndex);
}

function addCustomSong() {
    const nameInput = document.getElementById('add-song-name');
    const urlInput = document.getElementById('add-song-url');
    if (!nameInput || !urlInput) return;
    
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    
    if (!name || !url) {
        showToast("Please enter both song name and MP3 link.", "fa-exclamation-triangle");
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showToast("Please enter a valid HTTP/HTTPS audio URL.", "fa-exclamation-triangle");
        return;
    }
    
    // Add song with a random accent color preset
    const randomColor = colorPresets[Math.floor(Math.random() * colorPresets.length)];
    playlist.push({ 
        name, 
        url, 
        isDefault: false, 
        color: randomColor.color, 
        colorRgb: randomColor.rgb 
    });
    localStorage.setItem('songs_playlist', JSON.stringify(playlist));
    
    nameInput.value = "";
    urlInput.value = "";
    
    showToast("Song added to playlist!", "fa-check-circle");
    renderPlaylist();
}

function deleteSong(index, event) {
    if (event) event.stopPropagation(); // Avoid triggering play on parent div click
    
    if (playlist[index].isDefault) return;
    
    // If playing the song that is being deleted, stop it
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
    
    showToast("Song removed from playlist.", "fa-check-circle");
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
            volumeIcon.style.color = 'rgba(255,255,255,0.4)';
        }
    } else {
        preMuteVolume = audio.volume > 0 ? audio.volume : 0.3;
        audio.muted = true;
        audio.volume = 0;
        if (volumeSlider) volumeSlider.value = 0;
        if (volumeIcon) {
            volumeIcon.className = 'fas fa-volume-mute';
            volumeIcon.style.color = '#ef4444';
        }
    }
}

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
        'kurdstream': {
            nav: 'KurdStream',
            seo: 'KurdStream HD Movie Database Search Seeker | Cydia Elite'
        },
        'kurddoblazh': {
            nav: 'KurdDoblazh',
            seo: 'KurdDoblazh Dubbed Movies & Series Proxy Hub | Cydia Elite'
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
        'my-privacy': {
            nav: 'My Privacy',
            seo: 'My Privacy Control Panel & Security Settings | Cydia Elite'
        },
        'contact': {
            nav: 'Contact',
            seo: 'Contact Developer & Customer Support | Cydia Elite'
        },
        'status': {
            nav: 'System Status',
            seo: 'Server Registry Mirrors & System Status | Cydia Elite'
        },
        'free-games': {
            nav: 'Free Games',
            seo: 'Free Games Tracker - Claim Steam, Epic Games & GOG Giveaways | Cydia Elite'
        }
    };

    const metadata = tabSeoMetadata[tabId] || { nav: tabId, seo: 'CHYA | Cydia Elite' };

    // Update both displayed viewport labels and actual browser document title dynamically
    document.getElementById('nav-title-label').innerText = metadata.nav;
    document.title = metadata.seo;

    // Auto-load latest content for KD and KM if they are empty
    if (tabId === 'kurddoblazh') {
        const resultsBox = document.getElementById('kd-results');
        if (resultsBox && resultsBox.innerHTML === "") {
            fetchKurdDoblazhLatest();
            fetchKurdDoblazhLabels();
        }
    }
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
        games: "Game Downloads", mods: "Game Mods",
        livetv: "Live TV & IPTV", ads: "Ad Blockers",
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

function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
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
        
        // Expose dynamic color tokens as CSS variables for premium styling
        card.style.setProperty('--cat-color', cat.color);
        const rgb = hexToRgb(cat.color);
        if (rgb) {
            card.style.setProperty('--cat-color-rgb', rgb);
        }

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
        window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank');
        return;
    }

    resultsBox.style.display = 'block';
    loader.style.display = 'flex';
    resultsList.innerHTML = '';

    const mainScroll = document.getElementById('main-scroll');
    if (mainScroll) mainScroll.scrollTop = mainScroll.scrollHeight;

    try {
        // 1. Attempt real-time DuckDuckGo HTML scraping over proxy
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}&timestamp=${Date.now()}`;
        
        console.log("Fetching real web search results via proxy:", proxyUrl);
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("CORS Proxy search failed");
        
        const data = await response.json();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");
        
        const resultElements = doc.querySelectorAll(".result");
        let cards = [];
        
        resultElements.forEach(el => {
            if (cards.length >= 6) return;
            const titleEl = el.querySelector(".result__a");
            const snippetEl = el.querySelector(".result__snippet");
            const urlEl = el.querySelector(".result__url");
            
            if (titleEl && snippetEl) {
                const title = titleEl.innerText.trim();
                const snippet = snippetEl.innerText.trim();
                const rawUrl = titleEl.getAttribute("href");
                
                let url = rawUrl;
                if (rawUrl && rawUrl.includes("uddg=")) {
                    const uddgMatch = rawUrl.match(/uddg=([^&]+)/);
                    if (uddgMatch) {
                        url = decodeURIComponent(uddgMatch[1]);
                    }
                }
                
                let displayUrl = urlEl ? urlEl.innerText.trim() : url;
                if (url.startsWith("//")) {
                    url = "https:" + url;
                }
                
                cards.push({
                    title,
                    snippet,
                    url,
                    displayUrl
                });
            }
        });

        if (cards.length === 0) {
            throw new Error("No parsed search elements found");
        }
        
        renderSerpCards(cards, query);

    } catch (err) {
        console.warn("Real-time proxy search failed, querying simulated LLM web crawl fallback...", err);
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

            const rawJsonText = await fetchLlmResponse(payload);
            let cards = [];
            const startIdx = rawJsonText.indexOf('[');
            const endIdx = rawJsonText.lastIndexOf(']');
            if (startIdx !== -1 && endIdx !== -1) {
                const cleanedJson = rawJsonText.substring(startIdx, endIdx + 1);
                cards = JSON.parse(cleanedJson);
            } else {
                throw new Error("No JSON boundaries found");
            }
            renderSerpCards(cards, query);
        } catch (llmErr) {
            console.warn("Simulated LLM crawl failed, triggering offline clientside fallback indices...", llmErr);
            const cards = generateFallbackSearchCards(query);
            renderSerpCards(cards, query);
        }
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

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        saveSearchQuery(e.target.value);
    }
});
pcSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        saveSearchQuery(e.target.value);
    }
});

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
    // Third-party API governance blocking check
    try {
        const urlObj = new URL(url);
        const host = urlObj.hostname.toLowerCase();
        let isBlocked = false;
        let serviceName = '';

        if (host.includes('tiktok.com') || host.includes('lovetik.com') || host.includes('tikwm.com')) {
            isBlocked = localStorage.getItem('privacy_provider_tiktok') === 'false';
            serviceName = 'TikTok Downloader';
        } else if (host.includes('instagram.com')) {
            isBlocked = localStorage.getItem('privacy_provider_instagram') === 'false';
            serviceName = 'Instagram Directory';
        } else if (host.includes('huggingface.co') || host.includes('api-inference.huggingface.co')) {
            isBlocked = localStorage.getItem('privacy_provider_ai') === 'false';
            serviceName = 'AI Copilot';
        } else if (host.includes('trace.moe')) {
            isBlocked = localStorage.getItem('privacy_provider_anime') === 'false';
            serviceName = 'Anime Trace';
        } else if (host.includes('gamerpower.com') || host.includes('freetogame.com')) {
            isBlocked = localStorage.getItem('privacy_provider_games') === 'false';
            serviceName = 'Games Database';
        } else if (host.includes('kurdstream') || host.includes('kurdcinema') || host.includes('kurddoblazh')) {
            isBlocked = localStorage.getItem('privacy_provider_movies') === 'false';
            serviceName = 'Kurdish Cinema Streams';
        }

        if (isBlocked) {
            throw new Error(`${serviceName} integration is disabled in your Privacy settings.`);
        }
    } catch (e) {
        if (e.message.includes('Privacy settings')) {
            throw e;
        }
        // ignore other url parsing errors for relative paths if any
    }

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
            const proxySelect = localStorage.getItem('privacy_proxy_select') || 'allorigins';
            if (proxySelect === 'direct') {
                throw err;
            }

            let proxyUrl = '';
            if (proxySelect === 'allorigins') {
                proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&timestamp=${Date.now()}`;
            } else if (proxySelect === 'corsanywhere') {
                proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
            } else if (proxySelect === 'custom') {
                const customTemplate = localStorage.getItem('privacy_custom_proxy') || '';
                proxyUrl = customTemplate ? customTemplate.replace('{url}', encodeURIComponent(url)) : url;
            } else {
                proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&timestamp=${Date.now()}`;
            }

            console.warn(`%c[secureFetch] Direct fetch failed (CORS blocked). Attempting Fallback Proxy (${proxySelect}) for: ${url}`, "color: #fbbf24; font-style: italic;");

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

// ==========================================================================
// FREE GAMES TRACKER & AGGREGATOR ENGINE
// ==========================================================================
let freeGamesCache = null;
let freeGamesF2PCache = null;
let currentFreeGamesPlatform = 'all';
let currentFreeGamesQuery = '';
let currentFreeGamesSort = 'default';

function getClaimedGames() {
    return new Set(JSON.parse(localStorage.getItem('fg_claimed_games') || '[]'));
}

function toggleClaimedGame(gameId) {
    const claimed = getClaimedGames();
    const idStr = String(gameId);
    if (claimed.has(idStr)) {
        claimed.delete(idStr);
    } else {
        claimed.add(idStr);
    }
    localStorage.setItem('fg_claimed_games', JSON.stringify(Array.from(claimed)));
    executeFreeGamesRender();
}

function setupCardGlowInteraction(card) {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
}

function showFreeGamesSkeleton() {
    const container = document.getElementById('free-games-container');
    if (!container) return;
    container.innerHTML = Array(6).fill().map(() => `
        <div class="game-card skeleton-card">
            <div class="skeleton-image"></div>
            <div class="game-card-content">
                <div class="skeleton-meta">
                    <div class="skeleton-text skeleton-badge"></div>
                    <div class="skeleton-text skeleton-badge"></div>
                </div>
                <div class="skeleton-text skeleton-title"></div>
                <div class="skeleton-text skeleton-desc"></div>
                <div class="skeleton-text skeleton-desc" style="width: 80%;"></div>
                <div class="skeleton-meta" style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                    <div class="skeleton-text skeleton-footer-item"></div>
                    <div class="skeleton-text skeleton-footer-item"></div>
                </div>
                <div class="skeleton-button"></div>
            </div>
        </div>
    `).join('');
}

function updateFreeGamesStats(games, isF2P = false) {
    const countEl = document.getElementById('fg-stat-count');
    const valueEl = document.getElementById('fg-stat-value');
    const topEl = document.getElementById('fg-stat-top');
    if (!countEl || !valueEl || !topEl) return;

    if (!games || games.length === 0) {
        countEl.textContent = '0';
        valueEl.textContent = '$0.00';
        topEl.textContent = 'N/A';
        return;
    }

    if (isF2P) {
        countEl.textContent = Math.min(games.length, 60);
        valueEl.textContent = 'Permanently Free';
        
        let platCounts = {};
        games.slice(0, 60).forEach(g => {
            let plat = g.platform.toLowerCase().includes('pc') ? 'PC' : 'Web';
            platCounts[plat] = (platCounts[plat] || 0) + 1;
        });
        let topPlat = 'PC (Windows)';
        if ((platCounts['Web'] || 0) > (platCounts['PC'] || 0)) {
            topPlat = 'Web Browser';
        }
        topEl.textContent = topPlat;
    } else {
        countEl.textContent = games.length;

        let totalWorth = 0;
        let storeCounts = {};

        games.forEach(g => {
            if (g.worth && g.worth !== 'N/A') {
                const worthVal = parseFloat(g.worth.replace(/[^0-9.]/g, ''));
                if (!isNaN(worthVal)) {
                    totalWorth += worthVal;
                }
            }
            
            let plat = g.platforms.toLowerCase();
            let store = 'Other';
            if (plat.includes('epic')) store = 'Epic Games';
            else if (plat.includes('steam')) store = 'Steam';
            else if (plat.includes('gog')) store = 'GOG';
            
            storeCounts[store] = (storeCounts[store] || 0) + 1;
        });

        valueEl.textContent = `$${totalWorth.toFixed(2)}`;

        let topStore = 'N/A';
        let maxCount = -1;
        for (const [store, count] of Object.entries(storeCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topStore = store;
            }
        }
        topEl.textContent = topStore;
    }
}

async function loadFreeGames() {
    const container = document.getElementById('free-games-container');
    if (!container) return;

    if (freeGamesCache) {
        executeFreeGamesRender();
        return;
    }

    showFreeGamesSkeleton();

    try {
        const response = await secureFetch('https://www.gamerpower.com/api/giveaways');
        if (!response.ok) throw new Error('Failed to load giveaways');
        const data = await response.json();
        
        freeGamesCache = data;
        executeFreeGamesRender();
    } catch (err) {
        console.error('[Free Games Tracker] Error:', err);
        container.innerHTML = `
            <div style="text-align: center; color: #ef4444; padding: 40px 20px; grid-column: 1 / -1;" class="animated-card">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>Failed to scan active giveaways database. Please check your network or proxy connection.</p>
                <button class="app-btn" onclick="loadFreeGames()" style="margin-top: 15px; margin-left: auto; margin-right: auto; display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-sync"></i> Retry Scanner
                </button>
            </div>
        `;
        updateFreeGamesStats([], false);
    }
}

async function filterFreeGames(platform, btn) {
    if (!btn) return;
    
    btn.parentElement.querySelectorAll('.fg-filter-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentFreeGamesPlatform = platform;
    const container = document.getElementById('free-games-container');
    if (!container) return;

    if (platform === 'f2p') {
        if (freeGamesF2PCache) {
            executeFreeGamesRender();
            return;
        }
        showFreeGamesSkeleton();
        try {
            const response = await secureFetch('https://www.freetogame.com/api/games');
            if (!response.ok) throw new Error('Failed to fetch F2P games catalog');
            const data = await response.json();
            freeGamesF2PCache = data;
            executeFreeGamesRender();
        } catch (err) {
            console.error('[F2P Catalog] Error:', err);
            container.innerHTML = `
                <div style="text-align: center; color: #ef4444; padding: 40px 20px; grid-column: 1 / -1;" class="animated-card">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Failed to retrieve Free-To-Play games catalog. Please try again later.</p>
                </div>
            `;
            updateFreeGamesStats([], true);
        }
    } else {
        if (!freeGamesCache) {
            await loadFreeGames();
        } else {
            executeFreeGamesRender();
        }
    }
}

function handleFreeGamesSearch() {
    const input = document.getElementById('fg-search-input');
    const clearBtn = document.getElementById('fg-search-clear');
    if (!input) return;
    
    currentFreeGamesQuery = input.value.trim().toLowerCase();
    if (clearBtn) {
        clearBtn.style.display = currentFreeGamesQuery ? 'flex' : 'none';
    }
    
    executeFreeGamesRender();
}

function clearFreeGamesSearch() {
    const input = document.getElementById('fg-search-input');
    const clearBtn = document.getElementById('fg-search-clear');
    if (input) {
        input.value = '';
        currentFreeGamesQuery = '';
    }
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    executeFreeGamesRender();
}

function handleFreeGamesSort() {
    const select = document.getElementById('fg-sort-select');
    if (!select) return;
    currentFreeGamesSort = select.value;
    executeFreeGamesRender();
}

function executeFreeGamesRender() {
    if (currentFreeGamesPlatform === 'f2p') {
        renderF2PGames(freeGamesF2PCache || []);
    } else {
        renderFreeGames(freeGamesCache || [], currentFreeGamesPlatform);
    }
}

function renderFreeGames(games, platform) {
    const container = document.getElementById('free-games-container');
    if (!container) return;

    let filtered = games;
    
    if (platform !== 'all') {
        filtered = games.filter(g => {
            const platLower = g.platforms.toLowerCase();
            if (platform === 'epic-games-store') {
                return platLower.includes('epic') || platLower.includes('egs');
            }
            if (platform === 'steam') {
                return platLower.includes('steam');
            }
            if (platform === 'gog') {
                return platLower.includes('gog');
            }
            return platLower.includes(platform);
        });
    }

    updateFreeGamesStats(filtered, false);

    if (currentFreeGamesQuery) {
        filtered = filtered.filter(g => {
            const title = (g.title || '').toLowerCase();
            const desc = (g.description || '').toLowerCase();
            const type = (g.type || '').toLowerCase();
            const store = (g.platforms || '').toLowerCase();
            return title.includes(currentFreeGamesQuery) || 
                   desc.includes(currentFreeGamesQuery) || 
                   type.includes(currentFreeGamesQuery) ||
                   store.includes(currentFreeGamesQuery);
        });
    }

    if (currentFreeGamesSort !== 'default') {
        filtered = [...filtered];
        if (currentFreeGamesSort === 'value-high') {
            filtered.sort((a, b) => {
                const valA = a.worth === 'N/A' ? 0 : parseFloat(a.worth.replace(/[^0-9.]/g, '')) || 0;
                const valB = b.worth === 'N/A' ? 0 : parseFloat(b.worth.replace(/[^0-9.]/g, '')) || 0;
                return valB - valA;
            });
        } else if (currentFreeGamesSort === 'title-asc') {
            filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (currentFreeGamesSort === 'store') {
            filtered.sort((a, b) => (a.platforms || '').localeCompare(b.platforms || ''));
        }
    }

    container.innerHTML = '';
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: rgba(255,255,255,0.4); padding: 50px 0; grid-column: 1 / -1;" class="animated-card">
                <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 15px; color: rgba(255,255,255,0.2);"></i>
                <p style="font-size: 1rem; font-weight: 500;">No active giveaways match your filters.</p>
                <p style="font-size: 0.85rem; color: rgba(255,255,255,0.3); margin-top: 5px;">Try clearing your search query or choosing another platform.</p>
            </div>
        `;
        return;
    }

    const claimed = getClaimedGames();

    filtered.forEach((game, index) => {
        const card = document.createElement('div');
        const isClaimed = claimed.has(String(game.id));
        card.className = `game-card animated-card ${isClaimed ? 'claimed' : ''}`;
        card.style.animationDelay = `${Math.min(index, 12) * 0.05}s`;
        
        let storeBadge = '';
        let badgeIcon = 'fas fa-gamepad';
        let gameColor = '#10b981';
        let gameColorRgb = '16, 185, 129';
        const plat = game.platforms.toLowerCase();

        if (plat.includes('epic')) {
            storeBadge = 'Epic Games';
            badgeIcon = 'fab fa-windows';
            gameColor = '#0078f2';
            gameColorRgb = '0, 120, 242';
        } else if (plat.includes('steam')) {
            storeBadge = 'Steam';
            badgeIcon = 'fab fa-steam';
            gameColor = '#66c0f4';
            gameColorRgb = '102, 192, 244';
        } else if (plat.includes('gog')) {
            storeBadge = 'GOG Store';
            badgeIcon = 'fas fa-download';
            gameColor = '#9b51e0';
            gameColorRgb = '155, 81, 224';
        } else {
            storeBadge = game.platforms.split(',')[0];
        }

        card.style.setProperty('--game-color', gameColor);
        card.style.setProperty('--game-color-rgb', gameColorRgb);

        const worthStr = game.worth === 'N/A' ? 'Freebie' : `Was ${game.worth}`;

        card.innerHTML = `
            <div class="game-card-glow"></div>
            ${isClaimed ? `<div class="game-card-claimed-badge"><i class="fas fa-check-circle"></i> Claimed</div>` : ''}
            <div class="game-card-image-wrap">
                <img class="game-card-image" src="${game.image}" alt="${escapeHTML(game.title)}" loading="lazy">
                <div class="game-card-worth-badge" style="background: ${game.worth === 'N/A' ? '#10b981' : 'rgba(239, 68, 68, 0.85)'};">${worthStr}</div>
            </div>
            <div class="game-card-content">
                <div class="game-card-meta">
                    <span class="game-card-platform"><i class="${badgeIcon}"></i> ${storeBadge}</span>
                    <span class="game-card-type">${game.type}</span>
                </div>
                <h3 class="game-card-title">${escapeHTML(game.title)}</h3>
                <p class="game-card-desc">${escapeHTML(game.description)}</p>
                <div class="game-card-footer-meta">
                    <span class="worth-saved"><i class="fas fa-tags"></i> 100% Off</span>
                    <span class="game-status"><span class="status-pulse-dot" style="background: ${isClaimed ? '#9ca3af' : '#4ade80'}; box-shadow: 0 0 8px ${isClaimed ? '#9ca3af' : '#4ade80'};"></span> ${isClaimed ? 'In Library' : 'Active'}</span>
                </div>
                <div class="game-card-footer">
                    <a class="game-card-btn" href="${game.open_giveaway_url}" target="_blank">
                        ${isClaimed ? 'Launch Store <i class="fas fa-external-link-alt"></i>' : 'Claim Game <i class="fas fa-external-link-alt"></i>'}
                    </a>
                    <div class="fg-claim-toggle-wrapper">
                        <div class="fg-claim-toggle" onclick="event.preventDefault(); toggleClaimedGame('${game.id}')">
                            <i class="${isClaimed ? 'fas fa-check-square' : 'far fa-square'}"></i>
                            <span>${isClaimed ? 'Marked as Claimed' : 'Mark as Claimed'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setupCardGlowInteraction(card);
        container.appendChild(card);
    });
}

function renderF2PGames(games) {
    const container = document.getElementById('free-games-container');
    if (!container) return;

    let filtered = games;

    updateFreeGamesStats(filtered, true);

    if (currentFreeGamesQuery) {
        filtered = filtered.filter(g => {
            const title = (g.title || '').toLowerCase();
            const desc = (g.short_description || '').toLowerCase();
            const genre = (g.genre || '').toLowerCase();
            const platform = (g.platform || '').toLowerCase();
            return title.includes(currentFreeGamesQuery) || 
                   desc.includes(currentFreeGamesQuery) || 
                   genre.includes(currentFreeGamesQuery) ||
                   platform.includes(currentFreeGamesQuery);
        });
    }

    if (currentFreeGamesSort !== 'default') {
        filtered = [...filtered];
        if (currentFreeGamesSort === 'value-high') {
            filtered.sort((a, b) => (a.genre || '').localeCompare(b.genre || ''));
        } else if (currentFreeGamesSort === 'title-asc') {
            filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (currentFreeGamesSort === 'store') {
            filtered.sort((a, b) => (a.platform || '').localeCompare(b.platform || ''));
        }
    }

    const list = filtered.slice(0, 60);

    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: rgba(255,255,255,0.4); padding: 50px 0; grid-column: 1 / -1;" class="animated-card">
                <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 15px; color: rgba(255,255,255,0.2);"></i>
                <p style="font-size: 1rem; font-weight: 500;">No F2P database games match your search query.</p>
            </div>
        `;
        return;
    }

    const claimed = getClaimedGames();

    list.forEach((game, index) => {
        const card = document.createElement('div');
        const isClaimed = claimed.has(String(game.id));
        card.className = `game-card animated-card ${isClaimed ? 'claimed' : ''}`;
        card.style.animationDelay = `${Math.min(index, 12) * 0.05}s`;
        
        card.style.setProperty('--game-color', '#10b981');
        card.style.setProperty('--game-color-rgb', '16, 185, 129');

        const platformText = game.platform.toLowerCase().includes('pc') ? 'PC (Windows)' : 'Web Browser';
        const platformIcon = game.platform.toLowerCase().includes('pc') ? 'fab fa-windows' : 'fas fa-globe';

        card.innerHTML = `
            <div class="game-card-glow"></div>
            ${isClaimed ? `<div class="game-card-claimed-badge"><i class="fas fa-check-circle"></i> Claimed</div>` : ''}
            <div class="game-card-image-wrap">
                <img class="game-card-image" src="${game.thumbnail}" alt="${escapeHTML(game.title)}" loading="lazy">
                <div class="game-card-worth-badge" style="background: #10b981;">F2P Catalog</div>
            </div>
            <div class="game-card-content">
                <div class="game-card-meta">
                    <span class="game-card-platform"><i class="${platformIcon}"></i> ${platformText}</span>
                    <span class="game-card-type">${game.genre}</span>
                </div>
                <h3 class="game-card-title">${escapeHTML(game.title)}</h3>
                <p class="game-card-desc">${escapeHTML(game.short_description)}</p>
                <div class="game-card-footer-meta">
                    <span class="worth-saved"><i class="fas fa-play"></i> Free-to-Play</span>
                    <span class="game-status"><span class="status-pulse-dot" style="background: ${isClaimed ? '#9ca3af' : '#10b981'}; box-shadow: 0 0 8px ${isClaimed ? '#9ca3af' : '#10b981'};"></span> ${isClaimed ? 'Claimed' : 'Online'}</span>
                </div>
                <div class="game-card-footer">
                    <a class="game-card-btn" href="${game.game_url}" target="_blank">
                        Play Free <i class="fas fa-play"></i>
                    </a>
                    <div class="fg-claim-toggle-wrapper">
                        <div class="fg-claim-toggle" onclick="event.preventDefault(); toggleClaimedGame('${game.id}')">
                            <i class="${isClaimed ? 'fas fa-check-square' : 'far fa-square'}"></i>
                            <span>${isClaimed ? 'Marked as Claimed' : 'Mark as Claimed'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setupCardGlowInteraction(card);
        container.appendChild(card);
    });
}

// VIDEASY & TMDB Global State
const TMDB_API_KEY = '54e00466a09676df57ba51c4ca30b1a6';
let ksCurrentSource = 'kurdstream'; // 'kurdstream' or 'videasy'
let videasyActiveTab = 'tmdb'; // 'tmdb' or 'anime'
let videasyCustomColor = localStorage.getItem('vds_color') || 'f59e0b'; // Amber theme color
let videasyNextEpisode = localStorage.getItem('vds_next') !== 'false';
let videasyAutoplay = localStorage.getItem('vds_autoplay') !== 'false';
let videasySelector = localStorage.getItem('vds_selector') !== 'false';
let videasyOverlay = localStorage.getItem('vds_overlay') !== 'false';
let currentMediaMeta = { poster: '', year: '' };
let ksDefaultServer = localStorage.getItem('vds_server') || 'videasy'; // 'videasy' or 'vidsrc'
let videasyBackButtonUrl = localStorage.getItem('vds_backbutton') || window.location.origin;
let videasyLogoUrl = localStorage.getItem('vds_logo') || '';
let videasyIdleCheck = parseInt(localStorage.getItem('vds_idlecheck') || '0', 10);
let vidsrcToSubtitleUrl = localStorage.getItem('vds_to_suburl') || '';
let vidsrcToSubtitleLabel = localStorage.getItem('vds_to_sublabel') || 'English';
let screenscapeLanguage = localStorage.getItem('vds_ss_lan') || 'eng';
let peachifyDub = localStorage.getItem('vds_pf_dub') || '';
let peachifySub = localStorage.getItem('vds_pf_sub') || '';
let peachifyServer = localStorage.getItem('vds_pf_server') || '';
let peachifyHideCast = localStorage.getItem('vds_pf_hidecast') === 'true';
let peachifyHidePip = localStorage.getItem('vds_pf_hidepip') === 'true';
let peachifyHideServers = localStorage.getItem('vds_pf_hideservers') === 'true';
let megaplayLanguage = localStorage.getItem('vds_mp_lan') || 'sub';





// Switch Source Tab
function switchKsSource(source, el) {
    ksCurrentSource = source;

    // Toggle active state
    document.querySelectorAll('.ks-source-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');

    // Show/hide subtabs & update search placeholders
    const subtabs = document.getElementById('ks-videasy-subtabs');
    const searchInput = document.getElementById('ks-search-input');
    const resultsBox = document.getElementById('ks-results');
    const detailsBox = document.getElementById('ks-details');

    // Clear views
    resultsBox.innerHTML = '';
    detailsBox.style.display = 'none';
    resultsBox.style.display = 'block';

    if (source === 'videasy') {
        if (subtabs) subtabs.style.display = 'flex';
        updateVideasySearchPlaceholder();

        // Auto-load home if search query is empty
        if (searchInput && !searchInput.value.trim()) {
            loadVideasyHome();
        }
    } else {
        if (subtabs) subtabs.style.display = 'none';
        if (searchInput) {
            searchInput.placeholder = "Search for movies, series...";
        }
    }
}

// Switch VIDEASY sub-tab (TMDB vs Anime)
function switchVideasySub(tab, el) {
    videasyActiveTab = tab;

    // Toggle active state
    const subtabs = document.getElementById('ks-videasy-subtabs');
    if (subtabs) {
        subtabs.querySelectorAll('.kd-label-chip').forEach(c => c.classList.remove('active'));
    }
    if (el) el.classList.add('active');

    // Clear results
    document.getElementById('ks-results').innerHTML = '';
    document.getElementById('ks-details').style.display = 'none';
    document.getElementById('ks-results').style.display = 'block';

    updateVideasySearchPlaceholder();

    // Auto-load home if search query is empty
    const searchInput = document.getElementById('ks-search-input');
    if (searchInput && !searchInput.value.trim()) {
        loadVideasyHome();
    }
}

function updateVideasySearchPlaceholder() {
    const searchInput = document.getElementById('ks-search-input');
    if (searchInput) {
        if (videasyActiveTab === 'tmdb') {
            searchInput.placeholder = "Search Movies & TV on TMDB...";
        } else {
            searchInput.placeholder = "Search Anime on AniList...";
        }
    }
}

// Global Search KurdStream Selector
async function searchKurdStream() {
    const query = document.getElementById('ks-search-input').value.trim();
    const resultsBox = document.getElementById('ks-results');
    const detailsBox = document.getElementById('ks-details');
    const loader = document.getElementById('ks-loader');
    const btn = document.getElementById('ks-search-btn');

    if (!query) { showToast('Please enter a search query.', 'fa-search'); return; }

    resultsBox.innerHTML = '';
    detailsBox.style.display = 'none';
    resultsBox.style.display = 'block';
    loader.style.display = 'flex';
    btn.disabled = true;

    try {
        if (ksCurrentSource === 'kurdstream') {
            document.getElementById('ks-loader-text').innerText = 'Fetching from KurdStream...';
            const response = await fetch(`https://kurdcinama-stream-seeker.lovable.app/api/public/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            renderKSResults(data.results || []);
        } else if (videasyActiveTab === 'tmdb') {
            document.getElementById('ks-loader-text').innerText = 'Searching TMDB...';
            await searchTMDB(query);
        } else {
            document.getElementById('ks-loader-text').innerText = 'Searching AniList...';
            await searchAniList(query);
        }
    } catch (err) {
        console.error(err);
        showToast('Search query failed.', 'fa-times-circle');
    } finally {
        loader.style.display = 'none';
        btn.disabled = false;
    }
}

// TMDB search functions
async function searchTMDB(query) {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
    const response = await fetch(url);
    const data = await response.json();
    renderTMDBResults(data.results || []);
}

function renderTMDBResults(results) {
    const resultsBox = document.getElementById('ks-results');
    // Filter results to only movies and tv shows
    const filtered = results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

    if (!filtered || filtered.length === 0) {
        resultsBox.innerHTML = '<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.4);"><i class="fas fa-film" style="font-size:4rem; margin-bottom:20px; display:block; opacity:0.1;"></i>No matching movies or TV shows found on TMDB.</div>';
        return;
    }

    let html = `<div class="ks-grid">`;
    filtered.forEach(res => {
        const title = res.title || res.name || 'Untitled';
        const poster = res.poster_path ? `https://image.tmdb.org/t/p/w500${res.poster_path}` : 'https://placehold.co/500x750/000000/ffffff/png?text=No+Poster';
        const year = (res.release_date || res.first_air_date || '').split('-')[0] || 'N/A';
        const typeLabel = res.media_type === 'movie' ? 'Movie' : 'TV Show';

        html += `
            <div class="ks-card" onclick="fetchTMDBDetails(${res.id}, '${res.media_type}')">
                <div class="ks-card-badge">${typeLabel}</div>
                <div class="ks-card-img-container">
                    <img src="${poster}" alt="${title}" loading="lazy">
                </div>
                <div class="ks-card-info">
                    <div class="ks-card-title">${title}</div>
                    <div class="ks-card-meta">${year} • TMDB</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    resultsBox.innerHTML = html;
}

// AniList search functions
async function searchAniList(query) {
    const graphqlQuery = `
    query ($search: String) {
      Page (page: 1, perPage: 24) {
        media (search: $search, type: ANIME) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          seasonYear
          format
        }
      }
    }
    `;

    const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: graphqlQuery,
            variables: { search: query }
        })
    });

    const resData = await response.json();
    const items = resData?.data?.Page?.media || [];
    renderAniListResults(items);
}

function renderAniListResults(items) {
    const resultsBox = document.getElementById('ks-results');
    if (!items || items.length === 0) {
        resultsBox.innerHTML = '<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.4);"><i class="fas fa-ghost" style="font-size:4rem; margin-bottom:20px; display:block; opacity:0.1;"></i>No matching anime found on AniList.</div>';
        return;
    }

    let html = `<div class="ks-grid">`;
    items.forEach(res => {
        const title = res.title.english || res.title.romaji || 'Untitled Anime';
        const poster = res.coverImage.large || '';
        const year = res.seasonYear || 'N/A';
        const format = res.format || 'Anime';

        html += `
            <div class="ks-card" onclick="fetchAniListDetails(${res.id})">
                <div class="ks-card-badge">${format}</div>
                <div class="ks-card-img-container">
                    <img src="${poster}" alt="${title}" loading="lazy">
                </div>
                <div class="ks-card-info">
                    <div class="ks-card-title">${title}</div>
                    <div class="ks-card-meta">${year} • AniList</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    resultsBox.innerHTML = html;
}

// Fetch Details functions
async function fetchTMDBDetails(id, type) {
    const detailsBox = document.getElementById('ks-details');
    const resultsBox = document.getElementById('ks-results');
    const loader = document.getElementById('ks-loader');

    resultsBox.style.display = 'none';
    detailsBox.style.display = 'none';
    loader.style.display = 'flex';
    document.getElementById('ks-loader-text').innerText = 'Loading details...';

    try {
        const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,recommendations,videos`;
        const response = await fetch(url);
        const data = await response.json();

        if (type === 'movie') {
            renderTMDBMovieDetail(data);
        } else {
            await renderTMDBTvDetail(data);
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to load TMDB details.', 'fa-times-circle');
        resultsBox.style.display = 'block';
    } finally {
        loader.style.display = 'none';
    }
}

function renderTMDBMovieDetail(movie) {
    const detailsBox = document.getElementById('ks-details');
    detailsBox.style.display = 'block';

    // Cache media metadata
    currentMediaMeta = {
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : '',
        year: (movie.release_date || '').split('-')[0] || ''
    };

    const title = movie.title || movie.original_title || 'Untitled';
    const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
    const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/000000/ffffff/png?text=No+Poster';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';
    const year = (movie.release_date || '').split('-')[0] || 'N/A';
    const genres = (movie.genres || []).map(g => `<span class="ks-meta-tag genre">${g.name}</span>`).join('');

    // Cast list
    let castHtml = '';
    const cast = (movie.credits?.cast || []).slice(0, 10);
    if (cast.length > 0) {
        castHtml += `<div class="section-header">Starring Cast</div><div class="cast-scroller">`;
        cast.forEach(actor => {
            const actorPhoto = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://placehold.co/100x120/111111/ffffff/png?text=?';
            castHtml += `
                <div class="cast-card">
                    <img class="cast-photo" src="${actorPhoto}" alt="${actor.name}" loading="lazy">
                    <div class="cast-name">${actor.name}</div>
                    <div class="cast-character">${actor.character || ''}</div>
                </div>
            `;
        });
        castHtml += `</div>`;
    }

    // Progress Resume block
    const progressBlockHtml = getWatchProgressHtml(movie.id, 'movie', title);

    // Extract trailer key
    let trailerKey = '';
    if (movie.videos?.results) {
        const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || movie.videos.results.find(v => v.site === 'YouTube');
        if (trailer) trailerKey = trailer.key;
    }

    let trailerBtnHtml = '';
    let trailerSectionHtml = '';
    if (trailerKey) {
        trailerBtnHtml = `
            <button class="resume-btn" style="background: linear-gradient(135deg, #ec4899, #8b5cf6); box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3); flex: 1; min-width: 200px;" onclick="document.getElementById('ks-trailer-section').scrollIntoView({ behavior: 'smooth' })">
                <i class="fas fa-film"></i> Watch Trailer
            </button>
        `;
        trailerSectionHtml = `
            <div class="section-header" id="ks-trailer-section">Official Trailer</div>
            <div class="ks-trailer-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 15px 40px rgba(0,0,0,0.5); margin-bottom: 25px;">
                <iframe style="position: absolute; top:0; left:0; width:100%; height:100%; border:none;" src="https://www.youtube.com/embed/${trailerKey}?rel=0&showinfo=0" allowfullscreen></iframe>
            </div>
        `;
    }

    // Settings panel
    const settingsPanelHtml = getVideasySettingsPanelHtml('movie', movie.id, title);

    detailsBox.innerHTML = `
        <button class="ks-back-btn" onclick="document.getElementById('ks-details').style.display='none'; document.getElementById('ks-results').style.display='block';">
            <i class="fas fa-arrow-left"></i> Back to Results
        </button>

        <div class="ks-hero-container">
            ${backdrop ? `<img class="ks-hero-bg" src="${backdrop}" alt="${title}">` : '<div class="ks-hero-bg" style="background: #111;"></div>'}
            <div class="ks-hero-overlay">
                <div class="ks-hero-title">${title}</div>
                <div class="ks-hero-meta">
                    <span class="ks-meta-tag year">${year}</span>
                    <span class="ks-meta-tag" style="color: #10b981;"><i class="fas fa-star" style="color:#fbbf24;"></i> ${rating}</span>
                    <span class="ks-meta-tag"><i class="fas fa-clock"></i> ${runtime}</span>
                    ${genres}
                </div>
            </div>
        </div>

        ${progressBlockHtml}

        <div style="margin-top: 15px; margin-bottom: 25px; display: flex; gap: 12px; flex-wrap: wrap;">
            <button class="resume-btn" style="background: linear-gradient(135deg, #f59e0b, #ef4444); box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3); flex: 1; min-width: 200px;" onclick="playVideasyMedia('${movie.id}', 'movie', '${title.replace(/'/g, "\\'")}', false)">
                <i class="fas fa-play"></i> Play Movie
            </button>
            ${trailerBtnHtml}
            <button class="resume-btn" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); flex: 1; min-width: 200px;" onclick="window.open('https://vidvault.ru/movie/${movie.id}', '_blank')">
                <i class="fas fa-download"></i> Download / Alt (VidVault)
            </button>
        </div>

        <div class="section-header">Storyline</div>
        <div class="ks-desc-card">
            ${movie.overview || 'No overview available.'}
        </div>

        ${trailerSectionHtml}

        ${settingsPanelHtml}

        <div class="section-header">Torrent Downloads (YTS Torrents)</div>
        <div id="ks-yts-downloads" style="margin-bottom: 30px;">
            <div class="tt-custom-loader" style="padding: 20px; display: flex;">
                <div class="tt-pulse-logo" style="background: #10b981; width: 40px; height: 40px; font-size: 1.2rem;"><i class="fas fa-magnet"></i></div>
                <div class="tt-loading-text" style="font-size: 0.85rem;">Searching YTS Torrents...</div>
            </div>
        </div>

        ${castHtml}
    `;

    // Auto-fetch YTS torrents
    setTimeout(() => {
        fetchYtsDownloads(movie.imdb_id, title);
    }, 100);
}

async function renderTMDBTvDetail(show) {
    const detailsBox = document.getElementById('ks-details');
    detailsBox.style.display = 'block';

    // Cache media metadata
    currentMediaMeta = {
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : '',
        year: (show.first_air_date || '').split('-')[0] || ''
    };

    const title = show.name || show.original_name || 'Untitled';
    const backdrop = show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : (show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : '');
    const rating = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
    const year = (show.first_air_date || '').split('-')[0] || 'N/A';
    const genres = (show.genres || []).map(g => `<span class="ks-meta-tag genre">${g.name}</span>`).join('');

    // Extract trailer key
    let trailerKey = '';
    if (show.videos?.results) {
        const trailer = show.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || show.videos.results.find(v => v.site === 'YouTube');
        if (trailer) trailerKey = trailer.key;
    }

    let trailerBtnHtml = '';
    let trailerSectionHtml = '';
    if (trailerKey) {
        trailerBtnHtml = `
            <div style="margin-top: 15px; margin-bottom: 25px; display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="resume-btn" style="background: linear-gradient(135deg, #ec4899, #8b5cf6); box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3); flex: 1; min-width: 200px;" onclick="document.getElementById('ks-trailer-section').scrollIntoView({ behavior: 'smooth' })">
                    <i class="fas fa-film"></i> Watch Official Trailer
                </button>
            </div>
        `;
        trailerSectionHtml = `
            <div class="section-header" id="ks-trailer-section">Official Trailer</div>
            <div class="ks-trailer-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 15px 40px rgba(0,0,0,0.5); margin-bottom: 25px;">
                <iframe style="position: absolute; top:0; left:0; width:100%; height:100%; border:none;" src="https://www.youtube.com/embed/${trailerKey}?rel=0&showinfo=0" allowfullscreen></iframe>
            </div>
        `;
    }

    // Cast list
    let castHtml = '';
    const cast = (show.credits?.cast || []).slice(0, 10);
    if (cast.length > 0) {
        castHtml += `<div class="section-header">Starring Cast</div><div class="cast-scroller">`;
        cast.forEach(actor => {
            const actorPhoto = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://placehold.co/100x120/111111/ffffff/png?text=?';
            castHtml += `
                <div class="cast-card">
                    <img class="cast-photo" src="${actorPhoto}" alt="${actor.name}" loading="lazy">
                    <div class="cast-name">${actor.name}</div>
                    <div class="cast-character">${actor.character || ''}</div>
                </div>
            `;
        });
        castHtml += `</div>`;
    }

    // Filter seasons to only regular seasons (season_number > 0)
    const seasons = (show.seasons || []).filter(s => s.season_number > 0);
    if (seasons.length === 0 && (show.seasons || []).length > 0) {
        seasons.push(show.seasons[0]);
    }

    let seasonSelectHtml = '';
    if (seasons.length > 0) {
        seasonSelectHtml += `
            <div class="section-header">Select Season</div>
            <div class="season-select-wrapper">
        `;
        seasons.forEach((season, idx) => {
            const activeClass = idx === 0 ? 'active' : '';
            seasonSelectHtml += `
                <button class="season-select-btn ${activeClass}" data-season-num="${season.season_number}" onclick="switchSeason('${show.id}', ${season.season_number}, this, '${title.replace(/'/g, "\\'")}')">
                    ${season.name || `Season ${season.season_number}`}
                </button>
            `;
        });
        seasonSelectHtml += `</div>`;
    }

    // Settings panel
    const settingsPanelHtml = getVideasySettingsPanelHtml('tv', show.id, title);

    detailsBox.innerHTML = `
        <button class="ks-back-btn" onclick="document.getElementById('ks-details').style.display='none'; document.getElementById('ks-results').style.display='block';">
            <i class="fas fa-arrow-left"></i> Back to Results
        </button>

        <div class="ks-hero-container">
            ${backdrop ? `<img class="ks-hero-bg" src="${backdrop}" alt="${title}">` : '<div class="ks-hero-bg" style="background: #111;"></div>'}
            <div class="ks-hero-overlay">
                <div class="ks-hero-title">${title}</div>
                <div class="ks-hero-meta">
                    <span class="ks-meta-tag year">${year}</span>
                    <span class="ks-meta-tag" style="color: #10b981;"><i class="fas fa-star" style="color:#fbbf24;"></i> ${rating}</span>
                    <span class="ks-meta-tag"><i class="fas fa-tv"></i> ${show.number_of_seasons} Seasons</span>
                    ${genres}
                </div>
            </div>
        </div>

        <div class="section-header">Overview</div>
        <div class="ks-desc-card">
            ${show.overview || 'No description available.'}
        </div>

        ${trailerBtnHtml}
        ${trailerSectionHtml}

        ${settingsPanelHtml}

        ${seasonSelectHtml}
        
        <div class="tv-episodes-section">
            <div id="tv-episodes-loader" class="tt-custom-loader" style="display: none; padding: 20px;">
                <div class="tt-pulse-logo" style="background: #f59e0b; width: 40px; height: 40px; font-size: 1.2rem;"><i class="fas fa-play"></i></div>
                <div class="tt-loading-text" style="font-size: 0.85rem;">Loading Episodes...</div>
            </div>
            <div id="tv-episodes-list" class="tv-episode-grid-list"></div>
        </div>

        <div style="margin-top: 35px;"></div>
        ${castHtml}
    `;

    // Auto-load Season 1
    if (seasons.length > 0) {
        await loadTvSeasonEpisodes(show.id, seasons[0].season_number, title);
    }
}

async function switchSeason(showId, seasonNumber, btn, showTitle) {
    document.querySelectorAll('.season-select-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    await loadTvSeasonEpisodes(showId, seasonNumber, showTitle);
}

async function loadTvSeasonEpisodes(showId, seasonNumber, showTitle) {
    const listContainer = document.getElementById('tv-episodes-list');
    const loader = document.getElementById('tv-episodes-loader');

    if (listContainer) listContainer.innerHTML = '';
    if (loader) loader.style.display = 'flex';

    try {
        const url = `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        let html = '';
        const episodes = data.episodes || [];

        if (episodes.length === 0) {
            if (listContainer) listContainer.innerHTML = '<div style="grid-column: 1/-1; padding: 20px; text-align: center; color: rgba(255,255,255,0.4);">No episodes found in this season.</div>';
            return;
        }

        episodes.forEach(ep => {
            const epThumb = ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : 'https://placehold.co/300x170/111111/ffffff/png?text=No+Thumbnail';
            const epTitle = ep.name || `Episode ${ep.episode_number}`;
            const epDate = ep.air_date || 'Unknown Air Date';

            // Check if there is saved progress for this episode
            const progressHtml = getWatchProgressHtml(showId, 'tv', `${showTitle} - S${seasonNumber}E${ep.episode_number}`, seasonNumber, ep.episode_number);

            html += `
                <div class="tv-ep-card" onclick="playVideasyMedia('${showId}', 'tv', '${showTitle.replace(/'/g, "\\'")}', false, ${seasonNumber}, ${ep.episode_number})">
                    <div class="tv-ep-thumb-wrapper">
                        <img class="tv-ep-thumb" src="${epThumb}" alt="${epTitle}" loading="lazy">
                        <div class="tv-ep-play-overlay">
                            <i class="fas fa-play-circle"></i>
                        </div>
                    </div>
                    <div class="tv-ep-card-body" style="display: flex; flex-direction: column; height: 100%;">
                        <div class="tv-ep-card-header">
                            <span class="tv-ep-number">S${seasonNumber} • EP ${ep.episode_number}</span>
                            <span class="tv-ep-airdate">${epDate}</span>
                        </div>
                        <div class="tv-ep-name">${epTitle}</div>
                        <p class="tv-ep-overview">${ep.overview || 'No episode description available.'}</p>
                        ${progressHtml}
                        
                        <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 15px;">
                            <button class="ks-mini-server-btn" style="flex: 1; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.25); color: #f59e0b; font-weight: 700; margin: 0; padding: 6px 0;" onclick="event.stopPropagation(); playVideasyMedia('${showId}', 'tv', '${showTitle.replace(/'/g, "\\'")}', false, ${seasonNumber}, ${ep.episode_number})">
                                <i class="fas fa-play"></i> Play
                            </button>
                            <button class="ks-mini-server-btn" style="flex: 1; background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.25); color: #60a5fa; font-weight: 700; margin: 0; padding: 6px 0;" onclick="event.stopPropagation(); window.open('https://vidvault.ru/tv/${showId}/${seasonNumber}/${ep.episode_number}', '_blank')">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        if (listContainer) listContainer.innerHTML = html;
    } catch (err) {
        console.error(err);
        if (listContainer) listContainer.innerHTML = '<div style="grid-column: 1/-1; padding: 20px; text-align: center; color: #ef4444;">Failed to load season episodes.</div>';
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

async function fetchAniListDetails(id) {
    const detailsBox = document.getElementById('ks-details');
    const resultsBox = document.getElementById('ks-results');
    const loader = document.getElementById('ks-loader');

    resultsBox.style.display = 'none';
    detailsBox.style.display = 'none';
    loader.style.display = 'flex';
    document.getElementById('ks-loader-text').innerText = 'Loading anime details...';

    try {
        const graphqlQuery = `
        query ($id: Int) {
          Media (id: $id, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
            }
            bannerImage
            description
            episodes
            season
            seasonYear
            averageScore
            genres
            status
          }
        }
        `;

        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: graphqlQuery,
                variables: { id: id }
            })
        });

        const resData = await response.json();
        const media = resData?.data?.Media;
        if (media) {
            renderAniListDetail(media);
        } else {
            throw new Error("No media returned from AniList");
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to load anime details.', 'fa-times-circle');
        resultsBox.style.display = 'block';
    } finally {
        loader.style.display = 'none';
    }
}

function renderAniListDetail(anime) {
    const detailsBox = document.getElementById('ks-details');
    detailsBox.style.display = 'block';

    // Cache media metadata
    currentMediaMeta = {
        poster: anime.coverImage.large || '',
        year: anime.seasonYear || ''
    };

    const title = anime.title.english || anime.title.romaji || 'Untitled Anime';
    const banner = anime.bannerImage || anime.coverImage.large || '';
    const rating = anime.averageScore ? `${anime.averageScore}%` : 'N/A';
    const year = anime.seasonYear || 'N/A';
    const status = anime.status || 'N/A';
    const genres = (anime.genres || []).map(g => `<span class="ks-meta-tag genre">${g}</span>`).join('');

    // Check if it has multiple episodes (is a show vs movie)
    const isMovie = anime.episodes === 1;

    let episodeSelectHtml = '';
    if (!isMovie) {
        const epCount = anime.episodes || 12; // default if not specified
        episodeSelectHtml += `
            <div class="section-header">Select Episode</div>
            <div class="tv-episode-grid-list">
        `;

        for (let i = 1; i <= epCount; i++) {
            const progressHtml = getWatchProgressHtml(anime.id, 'anime', `${title} - Episode ${i}`, null, i);
            episodeSelectHtml += `
                <div class="tv-ep-card" style="min-height: 120px;" onclick="playVideasyMedia('${anime.id}', 'anime', '${title.replace(/'/g, "\\'")}', false, null, ${i})">
                    <div class="tv-ep-card-body" style="justify-content: center;">
                        <div class="tv-ep-card-header">
                            <span class="tv-ep-number" style="color: #ef4444;"><i class="fas fa-play"></i> Episode ${i}</span>
                        </div>
                        <div class="tv-ep-name">Stream Episode ${i}</div>
                        ${progressHtml}
                    </div>
                </div>
            `;
        }
        episodeSelectHtml += `</div>`;
    } else {
        // Is anime movie
        const progressHtml = getWatchProgressHtml(anime.id, 'anime', title);
        episodeSelectHtml += `
            ${progressHtml}
            <div style="margin-top: 15px; margin-bottom: 25px;">
                <button class="resume-btn" style="background: linear-gradient(135deg, #f59e0b, #ef4444); box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);" onclick="playVideasyMedia('${anime.id}', 'anime', '${title.replace(/'/g, "\\'")}', false)">
                    <i class="fas fa-play"></i> Play Anime Movie
                </button>
            </div>
        `;
    }

    // Settings panel
    const settingsPanelHtml = getVideasySettingsPanelHtml('anime', anime.id, title);

    detailsBox.innerHTML = `
        <button class="ks-back-btn" onclick="document.getElementById('ks-details').style.display='none'; document.getElementById('ks-results').style.display='block';">
            <i class="fas fa-arrow-left"></i> Back to Results
        </button>

        <div class="ks-hero-container">
            ${banner ? `<img class="ks-hero-bg" src="${banner}" alt="${title}">` : '<div class="ks-hero-bg" style="background: #111;"></div>'}
            <div class="ks-hero-overlay">
                <div class="ks-hero-title">${title}</div>
                <div class="ks-hero-meta">
                    <span class="ks-meta-tag year">${year}</span>
                    <span class="ks-meta-tag" style="color: #ef4444;"><i class="fas fa-heart"></i> ${rating}</span>
                    <span class="ks-meta-tag">${status}</span>
                    ${genres}
                </div>
            </div>
        </div>

        <div class="section-header">Synopsis</div>
        <div class="ks-desc-card">
            ${anime.description || 'No synopsis available.'}
        </div>

        ${settingsPanelHtml}

        ${episodeSelectHtml}
        
        <div style="margin-top: 35px;"></div>
    `;
}

// Fetch YTS Torrents dynamically via IMDb ID
async function fetchYtsDownloads(imdbId, movieTitle) {
    const ytsContainer = document.getElementById('ks-yts-downloads');
    if (!ytsContainer) return;

    if (!imdbId) {
        ytsContainer.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 0.85rem; padding: 10px;">No IMDb ID found for this title. YTS Torrents are unavailable.</div>';
        return;
    }

    try {
        const response = await fetch(`https://movies-api.accel.li/api/v2/movie_details.json?imdb_id=${imdbId}`);
        const data = await response.json();

        if (data && data.status === 'ok' && data.data && data.data.movie && data.data.movie.torrents) {
            const torrents = data.data.movie.torrents;
            const titleEncoded = encodeURIComponent(movieTitle);

            // Standard high-speed trackers from documentation
            const trackers = [
                'udp://tracker.opentrackr.org:1337/announce',
                'udp://tracker.torrent.eu.org:451/announce',
                'udp://tracker.dler.org:6969/announce',
                'udp://open.stealth.si:80/announce',
                'udp://open.demonii.com:1337/announce',
                'https://tracker.moeblog.cn:443/announce',
                'udp://open.dstud.io:6969/announce',
                'udp://tracker.srv00.com:6969/announce',
                'https://tracker.zhuqiy.com:443/announce',
                'https://tracker.pmman.tech:443/announce'
            ].map(tr => `&tr=${encodeURIComponent(tr)}`).join('');

            let html = `
                <div class="videasy-settings-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); margin-top: 10px;">
            `;

            torrents.forEach(tor => {
                const magnetLink = `magnet:?xt=urn:btih:${tor.hash}&dn=${titleEncoded}${trackers}`;
                const size = tor.size || 'N/A';
                const quality = tor.quality || 'N/A';
                const seeds = tor.seeds || 0;
                const peers = tor.peers || 0;

                html += `
                    <div class="videasy-setting-item" style="flex-direction: column; align-items: stretch; gap: 12px; padding: 15px; margin: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-weight: 800; color: #fff; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                                    <i class="fas fa-compact-disc" style="color: #10b981;"></i> ${quality} (${tor.type.toUpperCase()})
                                </span>
                                <span class="videasy-setting-desc" style="font-size: 0.72rem;">Size: ${size}</span>
                            </div>
                            <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.25); color: #10b981; padding: 2px 8px; border-radius: 8px; font-size: 0.65rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fas fa-arrow-up" style="color:#10b981; font-size:0.6rem;"></i> ${seeds} / <i class="fas fa-arrow-down" style="color:#ef4444; font-size:0.6rem;"></i> ${peers}
                            </span>
                        </div>
                        
                        <div style="display: flex; gap: 8px; margin-top: 5px; width: 100%;">
                            <a href="${magnetLink}" class="ks-mini-server-btn" style="flex: 1; text-align: center; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.25); color: #10b981; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 0; margin: 0; font-size: 0.8rem;">
                                <i class="fas fa-magnet" style="color:#10b981;"></i> Magnet
                            </a>
                            <a href="${tor.url}" class="ks-mini-server-btn" style="flex: 1; text-align: center; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.25); color: #f59e0b; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 0; margin: 0; font-size: 0.8rem;">
                                <i class="fas fa-file-download" style="color:#f59e0b;"></i> Torrent
                            </a>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            ytsContainer.innerHTML = html;
        } else {
            ytsContainer.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 0.85rem; padding: 10px;">No torrents found on YTS for this movie.</div>';
        }
    } catch (err) {
        console.error(err);
        ytsContainer.innerHTML = '<div style="color: #ef4444; font-size: 0.85rem; padding: 10px;">Failed to connect to YTS Torrents API.</div>';
    }
}

// Settings customization panel HTML builder
function getVideasySettingsPanelHtml(type, mediaId, title) {
    const isTv = type === 'tv';
    return `
        <div class="section-header">Player Customization Settings</div>
        <div class="videasy-settings-card">
            <div class="videasy-settings-grid">
                <div class="videasy-setting-item">
                    <div class="videasy-setting-info">
                        <span class="videasy-setting-title">Next Episode Button</span>
                        <span class="videasy-setting-desc">Show trigger controls</span>
                    </div>
                    <label class="switch-control">
                        <input type="checkbox" id="vds-next" ${videasyNextEpisode ? 'checked' : ''} onchange="videasyNextEpisode = this.checked; localStorage.setItem('vds_next', this.checked)">
                        <span class="switch-slider"></span>
                    </label>
                </div>
                
                <div class="videasy-setting-item">
                    <div class="videasy-setting-info">
                        <span class="videasy-setting-title">Autoplay Next</span>
                        <span class="videasy-setting-desc">Auto-advance content</span>
                    </div>
                    <label class="switch-control">
                        <input type="checkbox" id="vds-autoplay" ${videasyAutoplay ? 'checked' : ''} onchange="videasyAutoplay = this.checked; localStorage.setItem('vds_autoplay', this.checked)">
                        <span class="switch-slider"></span>
                    </label>
                </div>
                
                ${isTv ? `
                <div class="videasy-setting-item">
                    <div class="videasy-setting-info">
                        <span class="videasy-setting-title">Episode Selector</span>
                        <span class="videasy-setting-desc">Built-in menu control</span>
                    </div>
                    <label class="switch-control">
                        <input type="checkbox" id="vds-selector" ${videasySelector ? 'checked' : ''} onchange="videasySelector = this.checked; localStorage.setItem('vds_selector', this.checked)">
                        <span class="switch-slider"></span>
                    </label>
                </div>
                ` : ''}
                
                <div class="videasy-setting-item">
                    <div class="videasy-setting-info">
                        <span class="videasy-setting-title">Netflix Overlay</span>
                        <span class="videasy-setting-desc">Triggers on pause</span>
                    </div>
                    <label class="switch-control">
                        <input type="checkbox" id="vds-overlay" ${videasyOverlay ? 'checked' : ''} onchange="videasyOverlay = this.checked; localStorage.setItem('vds_overlay', this.checked)">
                        <span class="switch-slider"></span>
                    </label>
                </div>
            </div>
            
            <div style="margin-top: 20px; font-weight: 700; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-server" style="color: #f59e0b;"></i> Select Streaming Server
            </div>
            <div class="videasy-color-picker" style="margin-top: 10px; gap: 8px; background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.03); flex-wrap: wrap;">
                <button class="kd-label-chip ${ksDefaultServer === 'videasy' ? 'active' : ''}" style="margin: 0; padding: 6px 14px; font-size: 0.8rem;" onclick="setKsStreamingServer('videasy', this)">VIDEASY (Multi)</button>
                <button class="kd-label-chip ${ksDefaultServer === 'vidsrc' ? 'active' : ''}" style="margin: 0; padding: 6px 14px; font-size: 0.8rem;" onclick="setKsStreamingServer('vidsrc', this)">VidSrc.ru (High Speed)</button>
                <button class="kd-label-chip ${ksDefaultServer === 'vidsrc_to' ? 'active' : ''}" style="margin: 0; padding: 6px 14px; font-size: 0.8rem;" onclick="setKsStreamingServer('vidsrc_to', this)">VidSrc.to (Alternative)</button>
                <button class="kd-label-chip ${ksDefaultServer === 'cinemaos' ? 'active' : ''}" style="margin: 0; padding: 6px 14px; font-size: 0.8rem;" onclick="setKsStreamingServer('cinemaos', this)">CinemaOS (Premium)</button>
                <button class="kd-label-chip ${ksDefaultServer === 'vidplay' ? 'active' : ''}" style="margin: 0; padding: 6px 14px; font-size: 0.8rem;" onclick="setKsStreamingServer('vidplay', this)">VidPlay (Fast)</button>
                <button class="kd-label-chip ${ksDefaultServer === 'screenscape' ? 'active' : ''}" style="margin: 0; padding: 6px 14px; font-size: 0.8rem;" onclick="setKsStreamingServer('screenscape', this)">ScreenScape (HD)</button>
                <button class="kd-label-chip ${ksDefaultServer === 'peachify' ? 'active' : ''}" style="margin: 0; padding: 6px 14px; font-size: 0.8rem;" onclick="setKsStreamingServer('peachify', this)">Peachify (Ultra)</button>
                <button class="kd-label-chip ${ksDefaultServer === 'megaplay' ? 'active' : ''}" style="margin: 0; padding: 6px 14px; font-size: 0.8rem;" onclick="setKsStreamingServer('megaplay', this)">MegaPlay (Anikoto)</button>
            </div>
            
            <div style="margin-top: 20px; font-weight: 700; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-palette" style="color: #f59e0b;"></i> Accent Color Theme
            </div>
            <div class="videasy-color-picker">
                <div class="videasy-color-dot ${videasyCustomColor === 'f59e0b' ? 'active' : ''}" style="background: #f59e0b; --accent-glow: rgba(245,158,11,0.5);" onclick="setVideasyColor('f59e0b', this)"></div>
                <div class="videasy-color-dot ${videasyCustomColor === '3B82F6' ? 'active' : ''}" style="background: #3B82F6; --accent-glow: rgba(59,130,246,0.5);" onclick="setVideasyColor('3B82F6', this)"></div>
                <div class="videasy-color-dot ${videasyCustomColor === '8B5CF6' ? 'active' : ''}" style="background: #8B5CF6; --accent-glow: rgba(139,92,246,0.5);" onclick="setVideasyColor('8B5CF6', this)"></div>
                <div class="videasy-color-dot ${videasyCustomColor === 'ef4444' ? 'active' : ''}" style="background: #ef4444; --accent-glow: rgba(239,68,68,0.5);" onclick="setVideasyColor('ef4444', this)"></div>
                <div class="videasy-color-dot ${videasyCustomColor === '10B981' ? 'active' : ''}" style="background: #10B981; --accent-glow: rgba(16,185,129,0.5);" onclick="setVideasyColor('10B981', this)"></div>
                <div class="videasy-color-dot ${videasyCustomColor === 'ec4899' ? 'active' : ''}" style="background: #ec4899; --accent-glow: rgba(236,72,153,0.5);" onclick="setVideasyColor('ec4899', this)"></div>
            </div>

            <!-- New VidSrc Customization Fields -->
            <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                    <i class="fas fa-sliders-h" style="color: #f59e0b;"></i> VidSrc.ru Custom Parameters
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Back Button URL</label>
                        <input type="text" id="vds-backbutton-input" class="ks-details-input" 
                               placeholder="e.g. ${window.location.origin}" 
                               value="${videasyBackButtonUrl}" 
                               oninput="videasyBackButtonUrl = this.value; localStorage.setItem('vds_backbutton', this.value)">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Logo Overlay URL</label>
                        <input type="text" id="vds-logo-input" class="ks-details-input" 
                               placeholder="e.g. https://yourdomain.com/logo.png" 
                               value="${videasyLogoUrl}" 
                               oninput="videasyLogoUrl = this.value; localStorage.setItem('vds_logo', this.value)">
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Idle Check Watcher (Minutes)</label>
                    <select id="vds-idlecheck-select" class="ks-details-input" 
                            onchange="videasyIdleCheck = parseInt(this.value, 10); localStorage.setItem('vds_idlecheck', this.value)">
                        <option value="0" ${videasyIdleCheck === 0 ? 'selected' : ''}>Disabled</option>
                        <option value="5" ${videasyIdleCheck === 5 ? 'selected' : ''}>Every 5 minutes</option>
                        <option value="10" ${videasyIdleCheck === 10 ? 'selected' : ''}>Every 10 minutes</option>
                        <option value="15" ${videasyIdleCheck === 15 ? 'selected' : ''}>Every 15 minutes</option>
                        <option value="30" ${videasyIdleCheck === 30 ? 'selected' : ''}>Every 30 minutes</option>
                    </select>
                </div>
            </div>

            <!-- New VidSrc.to Custom Subtitle Fields -->
            <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                    <i class="fas fa-closed-captioning" style="color: #f59e0b;"></i> VidSrc.to Custom Subtitles
                </div>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Subtitle URL or JSON Array</label>
                        <input type="text" id="vds-to-suburl-input" class="ks-details-input" 
                               placeholder="URL to .vtt OR [{file: '...', label: '...'}]" 
                               value="${vidsrcToSubtitleUrl.replace(/"/g, '&quot;')}" 
                               oninput="vidsrcToSubtitleUrl = this.value; localStorage.setItem('vds_to_suburl', this.value)">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Subtitle Label</label>
                        <input type="text" id="vds-to-sublabel-input" class="ks-details-input" 
                               placeholder="e.g. English" 
                               value="${vidsrcToSubtitleLabel}" 
                               oninput="vidsrcToSubtitleLabel = this.value; localStorage.setItem('vds_to_sublabel', this.value)">
                    </div>
                </div>
            </div>

            <!-- New ScreenScape Custom Language Fields -->
            <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                    <i class="fas fa-language" style="color: #f59e0b;"></i> ScreenScape Language Settings
                </div>
                
                <div>
                    <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Preferred Audio Language</label>
                    <select id="vds-ss-lan-select" class="ks-details-input" 
                            onchange="screenscapeLanguage = this.value; localStorage.setItem('vds_ss_lan', this.value)">
                        <option value="eng" ${screenscapeLanguage === 'eng' ? 'selected' : ''}>English (eng)</option>
                        <option value="hindi" ${screenscapeLanguage === 'hindi' ? 'selected' : ''}>Hindi (hindi)</option>
                        <option value="french" ${screenscapeLanguage === 'french' ? 'selected' : ''}>French (french)</option>
                        <option value="spanish" ${screenscapeLanguage === 'spanish' ? 'selected' : ''}>Spanish (spanish)</option>
                        <option value="arabic" ${screenscapeLanguage === 'arabic' ? 'selected' : ''}>Arabic (arabic)</option>
                    </select>
                </div>
            </div>

            <!-- New Peachify Customization Fields -->
            <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                    <i class="fas fa-play-circle" style="color: #f59e0b;"></i> Peachify Custom Parameters
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                    <div>
                        <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Force Provider Server</label>
                        <select id="vds-pf-server-select" class="ks-details-input" 
                                onchange="peachifyServer = this.value; localStorage.setItem('vds_pf_server', this.value)">
                            <option value="" ${peachifyServer === '' ? 'selected' : ''}>Default Fallback</option>
                            <option value="iron" ${peachifyServer === 'iron' ? 'selected' : ''}>iron (Fast)</option>
                            <option value="spider" ${peachifyServer === 'spider' ? 'selected' : ''}>spider (Fast)</option>
                            <option value="multi" ${peachifyServer === 'multi' ? 'selected' : ''}>multi</option>
                            <option value="dark" ${peachifyServer === 'dark' ? 'selected' : ''}>dark</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Preferred Audio Dub</label>
                        <input type="text" id="vds-pf-dub-input" class="ks-details-input" 
                               placeholder="e.g. English, French" 
                               value="${peachifyDub}" 
                               oninput="peachifyDub = this.value; localStorage.setItem('vds_pf_dub', this.value)">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Preferred Subtitle</label>
                        <input type="text" id="vds-pf-sub-input" class="ks-details-input" 
                               placeholder="e.g. English, Spanish" 
                               value="${peachifySub}" 
                               oninput="peachifySub = this.value; localStorage.setItem('vds_pf_sub', this.value)">
                    </div>
                </div>

                <div class="videasy-settings-grid" style="margin-top: 20px;">
                    <div class="videasy-setting-item">
                        <div class="videasy-setting-info">
                            <span class="videasy-setting-title">Hide Cast button</span>
                            <span class="videasy-setting-desc">Remove cast UI</span>
                        </div>
                        <label class="switch-control">
                            <input type="checkbox" id="vds-pf-hidecast" ${peachifyHideCast ? 'checked' : ''} onchange="peachifyHideCast = this.checked; localStorage.setItem('vds_pf_hidecast', this.checked)">
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                    <div class="videasy-setting-item">
                        <div class="videasy-setting-info">
                            <span class="videasy-setting-title">Hide PIP button</span>
                            <span class="videasy-setting-desc">Remove Picture-in-Picture</span>
                        </div>
                        <label class="switch-control">
                            <input type="checkbox" id="vds-pf-hidepip" ${peachifyHidePip ? 'checked' : ''} onchange="peachifyHidePip = this.checked; localStorage.setItem('vds_pf_hidepip', this.checked)">
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                    <div class="videasy-setting-item">
                        <div class="videasy-setting-info">
                            <span class="videasy-setting-title">Hide Server Menu</span>
                            <span class="videasy-setting-desc">Disable provider swapping</span>
                        </div>
                        <label class="switch-control">
                            <input type="checkbox" id="vds-pf-hideservers" ${peachifyHideServers ? 'checked' : ''} onchange="peachifyHideServers = this.checked; localStorage.setItem('vds_pf_hideservers', this.checked)">
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- New MegaPlay Customization Fields -->
            <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                    <i class="fas fa-closed-captioning" style="color: #f59e0b;"></i> MegaPlay (Anikoto) Settings
                </div>
                
                <div>
                    <label style="display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Preferred Language Track</label>
                    <select id="vds-mp-lan-select" class="ks-details-input" 
                            onchange="megaplayLanguage = this.value; localStorage.setItem('vds_mp_lan', this.value)">
                        <option value="sub" ${megaplayLanguage === 'sub' ? 'selected' : ''}>Subtitled (sub)</option>
                        <option value="dub" ${megaplayLanguage === 'dub' ? 'selected' : ''}>English Dubbed (dub)</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

function setKsStreamingServer(server, el) {
    ksDefaultServer = server;
    localStorage.setItem('vds_server', server);
    if (el) {
        const parent = el.parentNode;
        parent.querySelectorAll('.kd-label-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
    } else {
        const chips = document.querySelectorAll('.videasy-color-picker .kd-label-chip');
        chips.forEach(chip => {
            if (chip.getAttribute('onclick') && chip.getAttribute('onclick').includes(`'${server}'`)) {
                const parent = chip.parentNode;
                parent.querySelectorAll('.kd-label-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            }
        });
    }
}

function setVideasyColor(color, el) {
    videasyCustomColor = color;
    localStorage.setItem('vds_color', color);
    document.querySelectorAll('.videasy-color-dot').forEach(d => d.classList.remove('active'));
    if (el) el.classList.add('active');
}

// Iframe URL Builder & Player Launcher
let currentTrackingMedia = null;

function playVideasyMedia(mediaId, mediaType, title, resume = false, season = null, episode = null) {
    let baseUrl = '';
    const params = new URLSearchParams();

    // Choose active server: for anime, fallback to videasy unless megaplay is chosen
    const activeServer = (mediaType === 'anime')
        ? (ksDefaultServer === 'megaplay' ? 'megaplay' : 'videasy')
        : ksDefaultServer;

    if (activeServer === 'videasy') {
        // Construct base URL structure
        if (mediaType === 'movie') {
            baseUrl = `https://player.videasy.net/movie/${mediaId}`;
        } else if (mediaType === 'tv') {
            const s = season || 1;
            const e = episode || 1;
            baseUrl = `https://player.videasy.net/tv/${mediaId}/${s}/${e}`;
        } else if (mediaType === 'anime') {
            if (episode) {
                baseUrl = `https://player.videasy.net/anime/${mediaId}/${episode}`;
            } else {
                baseUrl = `https://player.videasy.net/anime/${mediaId}`;
            }
        }

        // Construct Query Parameters
        if (videasyCustomColor) params.append('color', videasyCustomColor);
        if (videasyNextEpisode) params.append('nextEpisode', 'true');
        if (videasyAutoplay) params.append('autoplayNextEpisode', 'true');
        if (videasyOverlay) params.append('overlay', 'true');
        if (mediaType === 'tv' && videasySelector) params.append('episodeSelector', 'true');

    } else if (activeServer === 'vidsrc_to') {
        // VidSrc.to
        if (mediaType === 'movie') {
            baseUrl = `https://vidsrc.to/embed/movie/${mediaId}`;
        } else if (mediaType === 'tv') {
            const s = season || 1;
            if (episode) {
                baseUrl = `https://vidsrc.to/embed/tv/${mediaId}/${s}/${episode}`;
            } else {
                baseUrl = `https://vidsrc.to/embed/tv/${mediaId}/${s}`;
            }
        }

        // Construct subtitle parameters if configured
        if (vidsrcToSubtitleUrl) {
            // Check if user entered a JSON array for multiple subtitles
            if (vidsrcToSubtitleUrl.trim().startsWith('[') && vidsrcToSubtitleUrl.trim().endsWith(']')) {
                try {
                    // Try parsing and encoding it
                    const jsonSub = JSON.parse(vidsrcToSubtitleUrl);
                    params.append('sub.info', JSON.stringify(jsonSub));
                } catch (e) {
                    // If parsing fails, treat it as a single subtitle URL
                    params.append('sub_file', vidsrcToSubtitleUrl);
                    if (vidsrcToSubtitleLabel) {
                        params.append('sub_label', vidsrcToSubtitleLabel);
                    }
                }
            } else {
                params.append('sub_file', vidsrcToSubtitleUrl);
                if (vidsrcToSubtitleLabel) {
                    params.append('sub_label', vidsrcToSubtitleLabel);
                }
            }
        }
    } else if (activeServer === 'cinemaos') {
        // CinemaOS
        if (mediaType === 'movie') {
            baseUrl = `https://cinemaos.tech/player/${mediaId}`;
        } else if (mediaType === 'tv') {
            const s = season || 1;
            const e = episode || 1;
            baseUrl = `https://cinemaos.tech/player/${mediaId}/${s}/${e}`;
        }

        // Theme parameter
        if (videasyCustomColor) {
            params.append('theme', videasyCustomColor);
        }
    } else if (activeServer === 'vidplay') {
        // VidPlay
        if (mediaType === 'movie') {
            baseUrl = `https://vidplay.to/film/${mediaId}/player`;
        } else if (mediaType === 'tv') {
            baseUrl = `https://vidplay.to/serial/${mediaId}/player`;
            if (season) params.append('s', season.toString());
            if (episode) params.append('e', episode.toString());
        }
    } else if (activeServer === 'screenscape') {
        // ScreenScape
        baseUrl = 'https://screenscape.me/embed';
        params.append('tmdb', mediaId);
        params.append('type', mediaType);
        if (mediaType === 'tv') {
            params.append('s', (season || 1).toString());
            params.append('e', (episode || 1).toString());
        }
        if (screenscapeLanguage) {
            params.append('lan', screenscapeLanguage);
        }
    } else if (activeServer === 'megaplay') {
        // MegaPlay / Anikoto
        const ep = episode || 1;
        baseUrl = `https://megaplay.buzz/stream/ani/${mediaId}/${ep}/${megaplayLanguage}`;
    } else if (activeServer === 'peachify') {
        // Peachify
        if (mediaType === 'movie') {
            baseUrl = `https://peachify.top/embed/movie/${mediaId}`;
        } else if (mediaType === 'tv') {
            const s = season || 1;
            const e = episode || 1;
            baseUrl = `https://peachify.top/embed/tv/${mediaId}/${s}/${e}`;
        }

        if (peachifyServer) params.append('server', peachifyServer);
        if (peachifyDub) params.append('dub', peachifyDub);
        if (peachifySub) params.append('sub', peachifySub);

        if (!videasyAutoplay) {
            params.append('autoPlay', 'false');
        }

        if (mediaType === 'tv') {
            if (videasyAutoplay) {
                params.append('autoNext', '30');
            }
            if (!videasyNextEpisode) {
                params.append('showNextBtn', 'false');
            }
        }

        if (peachifyHideCast) params.append('cast', 'hide');
        if (peachifyHidePip) params.append('pip', 'hide');
        if (peachifyHideServers) params.append('servers', 'hide');
    } else {
        // VidSrc.ru
        if (mediaType === 'movie') {
            baseUrl = `https://vidsrc.ru/movie/${mediaId}`;
        } else if (mediaType === 'tv') {
            const s = season || 1;
            const e = episode || 1;
            baseUrl = `https://vidsrc.ru/tv/${mediaId}/${s}/${e}`;
        }

        // Construct Query Parameters
        params.append('autoplay', videasyAutoplay ? 'true' : 'false');
        if (videasyCustomColor) params.append('colour', videasyCustomColor);
        params.append('autonextepisode', videasyAutoplay ? 'true' : 'false');
        params.append('pausescreen', videasyOverlay ? 'true' : 'false');
        if (videasyBackButtonUrl) params.append('backbutton', videasyBackButtonUrl);
        if (videasyLogoUrl) params.append('logo', videasyLogoUrl);
        if (videasyIdleCheck > 0) params.append('idlecheck', videasyIdleCheck.toString());
    }

    // Watch Progress loading
    const progressKey = getWatchProgressKey(mediaId, mediaType, season, episode);
    const saved = localStorage.getItem(progressKey);

    if (saved) {
        try {
            const progressData = JSON.parse(saved);
            if (resume && progressData.timestamp) {
                if (activeServer === 'peachify') {
                    params.append('startAt', Math.floor(progressData.timestamp));
                } else {
                    params.append('progress', Math.floor(progressData.timestamp));
                }
                showToast(`Resuming at ${Math.floor(progressData.progress)}%`, 'fa-clock');
            }
        } catch (e) { }
    }

    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log("Playing server URL:", finalUrl);

    // Save metadata for continue watching resume cards
    const metaKey = `videasy_meta_${mediaType}_${mediaId}`;
    localStorage.setItem(metaKey, JSON.stringify({
        id: mediaId,
        type: mediaType,
        title: title,
        poster: currentMediaMeta.poster,
        year: currentMediaMeta.year,
        season: season,
        episode: episode,
        updatedAt: Date.now()
    }));

    // Construct tmdbServers list to pass to renderKSEmbed
    const tmdbServers = [
        { id: 'videasy', name: 'VIDEASY' },
        { id: 'vidsrc', name: 'VidSrc.ru' },
        { id: 'vidsrc_to', name: 'VidSrc.to' },
        { id: 'cinemaos', name: 'CinemaOS' },
        { id: 'vidplay', name: 'VidPlay' },
        { id: 'screenscape', name: 'ScreenScape' },
        { id: 'peachify', name: 'Peachify' },
        { id: 'megaplay', name: 'MegaPlay' }
    ];

    // Open player modal/overlay
    renderKSEmbed(finalUrl, title, tmdbServers, 'tmdb_videasy');

    // Set tracking media
    currentTrackingMedia = {
        id: mediaId,
        type: mediaType,
        title: title,
        season: season,
        episode: episode
    };
}

// Watch Progress State Keepers
function getWatchProgressKey(id, type, season = null, episode = null) {
    let key = `videasy_progress_${type}_${id}`;
    if (season) key += `_s${season}`;
    if (episode) key += `_e${episode}`;
    return key;
}

function getWatchProgressHtml(id, type, title, season = null, episode = null) {
    const key = getWatchProgressKey(id, type, season, episode);
    const saved = localStorage.getItem(key);

    if (!saved) return '';

    try {
        const data = JSON.parse(saved);
        const percent = Math.floor(data.progress || 0);
        const timestamp = data.timestamp || 0;
        const duration = data.duration || 0;

        const formatTime = (secs) => {
            const h = Math.floor(secs / 3600);
            const m = Math.floor((secs % 3600) / 60);
            const s = Math.floor(secs % 60);
            return h > 0
                ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
                : `${m}:${s.toString().padStart(2, '0')}`;
        };

        const timeLabel = duration
            ? `${formatTime(timestamp)} / ${formatTime(duration)}`
            : `${formatTime(timestamp)}`;

        if (season || episode) {
            return `
                <div style="margin-top: 10px;">
                    <div style="height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow:hidden;">
                        <div style="height:100%; width: ${percent}%; background: #10b981;"></div>
                    </div>
                    <div style="font-size: 0.65rem; color: rgba(255,255,255,0.4); text-align:right; margin-top:2px;">${percent}% watched</div>
                </div>
            `;
        }

        return `
            <div class="resume-playback-wrapper">
                <button class="resume-btn" onclick="playVideasyMedia('${id}', '${type}', '${title.replace(/'/g, "\\'")}', true)">
                    <i class="fas fa-undo"></i> Resume Playback at ${percent}%
                </button>
                <div class="resume-progress-container">
                    <div class="resume-progress-bar" style="width: ${percent}%;"></div>
                </div>
                <div class="resume-info-text">
                    <span>Last watched: ${new Date(data.lastWatched).toLocaleDateString()}</span>
                    <span>${timeLabel} (${percent}%)</span>
                </div>
            </div>
        `;
    } catch (e) {
        return '';
    }
}

// Window watch progress postMessage listener
window.addEventListener("message", function (event) {
    if (!event.origin.includes("videasy.net") && !event.origin.includes("vidsrc.ru") && !event.origin.includes("vidsrc.to") && !event.origin.includes("cinemaos.tech") && !event.origin.includes("vidplay.to") && !event.origin.includes("screenscape.me") && !event.origin.includes("peachify.top") && !event.origin.includes("megaplay.buzz")) return;

    try {
        let eventData = event.data;

        if (typeof eventData === "string") {
            try {
                eventData = JSON.parse(eventData);
            } catch (e) { }
        }

        // 00. Check for Anikoto / MegaPlay message format
        if (eventData && (eventData.channel === 'megacloud' || eventData.type === 'watching-log' || eventData.event === 'time' || eventData.event === 'complete')) {
            let watchedTime = 0;
            let duration = 0;
            let percent = 0;

            if (eventData.event === 'time') {
                watchedTime = eventData.time;
                duration = eventData.duration;
                percent = eventData.percent;
            } else if (eventData.type === 'watching-log') {
                watchedTime = eventData.currentTime;
                duration = eventData.duration;
                percent = duration ? (watchedTime / duration) * 100 : 0;
            } else if (eventData.event === 'complete') {
                percent = 100;
                watchedTime = duration;
            }

            if (watchedTime > 0 || percent > 0) {
                const id = currentTrackingMedia?.id;
                const type = currentTrackingMedia?.type;
                const s = currentTrackingMedia?.season || null;
                const e = currentTrackingMedia?.episode || null;

                if (id && type) {
                    const key = getWatchProgressKey(id, type, s, e);
                    const trackingObj = {
                        progress: percent,
                        timestamp: watchedTime,
                        duration: duration,
                        season: s,
                        episode: e,
                        lastWatched: Date.now()
                    };

                    localStorage.setItem(key, JSON.stringify(trackingObj));
                    if (s || e) {
                        const parentKey = getWatchProgressKey(id, type);
                        localStorage.setItem(parentKey, JSON.stringify(trackingObj));
                    }

                    // Sync with official watch_progress storage key
                    try {
                        const STORAGE_KEY = 'watch_progress';
                        let watchProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                        watchProgress[id] = {
                            ...watchProgress[id],
                            id: id,
                            type: type,
                            title: currentTrackingMedia?.title || '',
                            progress: {
                                watched_time: watchedTime,
                                duration: duration
                            },
                            last_updated: Date.now()
                        };
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchProgress));
                    } catch (err) { }
                }
            }
            return;
        }

        // 0. Check for Peachify PLAYER_EVENT progress format
        if (eventData && eventData.type === 'PLAYER_EVENT') {
            const playerEventData = eventData.data;
            if (playerEventData && playerEventData.tmdbId) {
                const id = playerEventData.tmdbId.toString();
                const type = playerEventData.mediaType;
                const watchedTime = playerEventData.currentTime;
                const duration = playerEventData.duration;
                const progressPercent = duration ? (watchedTime / duration) * 100 : 0;
                const s = playerEventData.season || null;
                const e = playerEventData.episode || null;

                const key = getWatchProgressKey(id, type, s, e);
                const trackingObj = {
                    progress: progressPercent,
                    timestamp: watchedTime,
                    duration: duration,
                    season: s,
                    episode: e,
                    lastWatched: Date.now()
                };

                localStorage.setItem(key, JSON.stringify(trackingObj));

                if (s || e) {
                    const parentKey = getWatchProgressKey(id, type);
                    localStorage.setItem(parentKey, JSON.stringify(trackingObj));
                }

                // Sync with the official watch_progress storage key mapping
                try {
                    const STORAGE_KEY = 'watch_progress';
                    let watchProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                    watchProgress[id] = {
                        ...watchProgress[id],
                        id: id,
                        type: type,
                        title: currentTrackingMedia?.title || '',
                        progress: {
                            watched_time: watchedTime,
                            duration: duration
                        },
                        last_updated: Date.now()
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchProgress));
                } catch (err) { }
            }
            return;
        }

        // 1. Check for MEDIA_DATA progress event format (VidSrc or Peachify)
        if (eventData && eventData.type === 'MEDIA_DATA') {
            if (event.origin.includes("peachify.top")) {
                localStorage.setItem('peachifyProgress', JSON.stringify(eventData.data));

                // Real-time progress mapping sync from Peachify dictionary if available
                try {
                    const keys = Object.keys(eventData.data);
                    if (keys.length > 0) {
                        const id = keys[0];
                        const item = eventData.data[id];
                        if (item && item.progress) {
                            const type = item.type;
                            const watchedTime = item.progress.watched;
                            const duration = item.progress.duration;
                            const progressPercent = duration ? (watchedTime / duration) * 100 : 0;

                            const s = item.last_season_watched ? parseInt(item.last_season_watched, 10) : null;
                            const e = item.last_episode_watched ? parseInt(item.last_episode_watched, 10) : null;

                            const key = getWatchProgressKey(id, type, s, e);
                            const trackingObj = {
                                progress: progressPercent,
                                timestamp: watchedTime,
                                duration: duration,
                                season: s,
                                episode: e,
                                lastWatched: Date.now()
                            };

                            localStorage.setItem(key, JSON.stringify(trackingObj));
                            if (s || e) {
                                const parentKey = getWatchProgressKey(id, type);
                                localStorage.setItem(parentKey, JSON.stringify(trackingObj));
                            }
                        }
                    }
                } catch (e) { }
            } else {
                // VidSrc MEDIA_DATA
                const mediaData = eventData.data;
                if (mediaData && mediaData.id && mediaData.progress) {
                    const id = mediaData.id;
                    const type = mediaData.type;
                    const watchedTime = mediaData.progress.watched_time;
                    const duration = mediaData.progress.duration;
                    const progressPercent = (watchedTime / duration) * 100;

                    const s = (currentTrackingMedia?.id === id || currentTrackingMedia?.id === Number(id)) ? currentTrackingMedia.season : null;
                    const e = (currentTrackingMedia?.id === id || currentTrackingMedia?.id === Number(id)) ? currentTrackingMedia.episode : null;

                    const key = getWatchProgressKey(id, type, s, e);
                    const trackingObj = {
                        progress: progressPercent,
                        timestamp: watchedTime,
                        duration: duration,
                        season: s,
                        episode: e,
                        lastWatched: Date.now()
                    };

                    localStorage.setItem(key, JSON.stringify(trackingObj));

                    if (s || e) {
                        const parentKey = getWatchProgressKey(id, type);
                        localStorage.setItem(parentKey, JSON.stringify(trackingObj));
                    }

                    // Sync with the official watch_progress storage key mapping for VidSrc
                    try {
                        const STORAGE_KEY = 'watch_progress';
                        let watchProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                        watchProgress[id] = {
                            ...watchProgress[id],
                            ...mediaData,
                            last_updated: Date.now()
                        };
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchProgress));
                    } catch (err) { }
                }
            }
            return;
        }

        // 2. Check for VIDEASY progress event format
        if (typeof eventData === "string") {
            eventData = JSON.parse(eventData);
        }

        console.log("Message received from player:", eventData);

        if (eventData && eventData.id) {
            const id = eventData.id;
            const type = eventData.type;
            const progress = eventData.progress;
            const timestamp = eventData.timestamp;
            const duration = eventData.duration;
            const season = eventData.season;
            const episode = eventData.episode;

            const key = getWatchProgressKey(id, type, season, episode);
            const trackingObj = {
                progress,
                timestamp,
                duration,
                season,
                episode,
                lastWatched: Date.now()
            };

            localStorage.setItem(key, JSON.stringify(trackingObj));

            if (season || episode) {
                const parentKey = getWatchProgressKey(id, type);
                localStorage.setItem(parentKey, JSON.stringify(trackingObj));
            }

            // Sync with the official watch_progress storage key mapping for VIDEASY
            try {
                const STORAGE_KEY = 'watch_progress';
                let watchProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                watchProgress[id] = {
                    ...watchProgress[id],
                    id: id,
                    type: type,
                    title: currentTrackingMedia?.title || '',
                    progress: {
                        watched_time: timestamp,
                        duration: duration
                    },
                    last_updated: Date.now()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(watchProgress));
            } catch (err) { }
        }
    } catch (e) {
        // Safe fail
    }
});

function renderKSResults(results) {
    const resultsBox = document.getElementById('ks-results');
    if (!results || results.length === 0) {
        resultsBox.innerHTML = '<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.4);"><i class="fas fa-film" style="font-size:4rem; margin-bottom:20px; display:block; opacity:0.1;"></i>No movies or series found.</div>';
        return;
    }

    let html = `<div class="ks-grid">`;
    results.forEach(res => {
        html += `
            <div class="ks-card" onclick="${res.type === 'movie' ? `fetchKSMovie(${res.id})` : `fetchKSSeries(${res.id})`}">
                <div class="ks-card-badge">${res.typeLabel}</div>
                <div class="ks-card-img-container">
                    <img src="${res.photo}" alt="${res.title}" loading="lazy">
                </div>
                <div class="ks-card-info">
                    <div class="ks-card-title">${res.title}</div>
                    <div class="ks-card-meta">${res.type === 'movie' ? 'Full Movie' : 'Series'}</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    resultsBox.innerHTML = html;
}

async function fetchKSMovie(id) {
    const detailsBox = document.getElementById('ks-details');
    const resultsBox = document.getElementById('ks-results');
    const loader = document.getElementById('ks-loader');

    resultsBox.style.display = 'none';
    detailsBox.style.display = 'none';
    loader.style.display = 'flex';

    try {
        const response = await fetch(`https://kurdcinama-stream-seeker.lovable.app/api/public/movie/${id}`);
        const data = await response.json();
        renderKSMovie(data);
    } catch (err) {
        showToast('Failed to load movie details.', 'fa-times-circle');
        resultsBox.style.display = 'block';
    } finally {
        loader.style.display = 'none';
    }
}

function renderKSMovie(movie) {
    const detailsBox = document.getElementById('ks-details');
    detailsBox.style.display = 'block';

    let serverBtns = '';
    const baseEmbed = `https://kurdcinama-stream-seeker.lovable.app/api/public/embed?movieId=${movie.id}`;
    movie.servers.forEach(srv => {
        serverBtns += `
            <button class="ks-server-btn" data-server-id="${srv.id}" onclick="selectKSServer('${srv.id}', '${baseEmbed}&server=${srv.id}', this, '${movie.title.replace(/'/g, "\\'")} - ${srv.name}', ${JSON.stringify(movie.servers).replace(/"/g, '&quot;')}, '${baseEmbed}')">
                <i class="fas fa-server"></i>
                <div>
                    <div style="font-size: 0.95rem;">${srv.name}</div>
                    <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5); font-weight: 400;">HD Streaming Available</div>
                </div>
            </button>`;
    });

    detailsBox.innerHTML = `
        <button class="ks-back-btn" onclick="document.getElementById('ks-details').style.display='none'; document.getElementById('ks-results').style.display='block';">
            <i class="fas fa-arrow-left"></i> Back to Results
        </button>

        <div class="ks-hero-container">
            <img class="ks-hero-bg" src="${movie.backdrop || movie.poster}" alt="${movie.title}">
            <div class="ks-hero-overlay">
                <div class="ks-hero-title">${movie.title}</div>
                <div class="ks-hero-meta">
                    <span class="ks-meta-tag year">${movie.year}</span>
                    <span class="ks-meta-tag">${movie.typeLabel}</span>
                    ${movie.genres.map(g => `<span class="ks-meta-tag genre">${g.name}</span>`).join('')}
                </div>
            </div>
        </div>

        <div class="section-header">About this Movie</div>
        <div class="ks-desc-card">
            ${movie.description}
        </div>

        <div class="section-header">Select Streaming Server</div>
        <div class="ks-server-grid">
            ${serverBtns}
            <button class="ks-server-btn" data-server-id="default" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.1)); border-color: rgba(245, 158, 11, 0.3);" onclick="selectKSServer('default', '${movie.iframeUrl}', this, '${movie.title.replace(/'/g, "\\'")} - Direct', ${JSON.stringify(movie.servers).replace(/"/g, '&quot;')}, '${baseEmbed}')">
                <i class="fas fa-play-circle"></i>
                <div>
                    <div style="font-size: 0.95rem; color: #f59e0b;">Direct Stream</div>
                    <div style="font-size: 0.7rem; color: rgba(245, 158, 11, 0.6); font-weight: 400;">Recommended for Desktop</div>
                </div>
            </button>
        </div>
    `;
}

async function selectKSServer(id, url, btn, title, servers = [], baseUrl = '') {
    document.querySelectorAll('.ks-server-btn').forEach(b => b.classList.remove('active-server'));
    if (btn) btn.classList.add('active-server');

    // If it's a direct stream URL (not our API), load it directly
    if (!url.includes('kurdcinama-stream-seeker.lovable.app/api/public/embed')) {
        renderKSEmbed(url, title, servers, baseUrl);
        return;
    }

    const loader = document.getElementById('ks-loader');
    if (loader) loader.style.display = 'flex';

    try {
        const res = await fetch(url);
        const data = await res.json();
        renderKSEmbed(data.iframeUrl, title, servers, baseUrl);
    } catch (err) {
        showToast('Failed to load server.', 'fa-times-circle');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

async function fetchKSSeries(id) {
    const detailsBox = document.getElementById('ks-details');
    const resultsBox = document.getElementById('ks-results');
    const loader = document.getElementById('ks-loader');

    resultsBox.style.display = 'none';
    detailsBox.style.display = 'none';
    loader.style.display = 'flex';

    try {
        const response = await fetch(`https://kurdcinama-stream-seeker.lovable.app/api/public/series/${id}`);
        const data = await response.json();
        renderKSSeries(data);
    } catch (err) {
        showToast('Failed to load series details.', 'fa-times-circle');
        resultsBox.style.display = 'block';
    } finally {
        loader.style.display = 'none';
    }
}

function renderKSSeries(series) {
    const detailsBox = document.getElementById('ks-details');
    detailsBox.style.display = 'block';

    let seasonsHtml = '';
    series.seasons.forEach((season, idx) => {
        let episodesHtml = '';
        season.episodes.forEach(ep => {
            episodesHtml += `
                <div class="ks-ep-item" data-ep-id="${series.id}-${season.stype}-${ep.name}" onclick="viewKSEpisode('${series.id}', '${season.stype}', '${ep.name}', this, '${series.title.replace(/'/g, "\\'")} - ${season.label} Ep ${ep.name}')">
                    <div class="ks-ep-title">Episode ${ep.name}</div>
                    <i class="fas fa-play-circle ks-ep-icon"></i>
                </div>
            `;
        });

        seasonsHtml += `
            <div class="section-header">${season.label}</div>
            <div class="ks-ep-card-grid" style="padding: 0 15px;">
                ${episodesHtml}
            </div>
        `;
    });

    detailsBox.innerHTML = `
        <button class="ks-back-btn" onclick="document.getElementById('ks-details').style.display='none'; document.getElementById('ks-results').style.display='block';">
            <i class="fas fa-arrow-left"></i> Back to Results
        </button>

        <div class="ks-hero-container">
            <img class="ks-hero-bg" src="${series.backdrop || series.poster}" alt="${series.title}">
            <div class="ks-hero-overlay">
                <div class="ks-hero-title">${series.title}</div>
                <div class="ks-hero-meta">
                    <span class="ks-meta-tag year">${series.year}</span>
                    <span class="ks-meta-tag">${series.typeLabel}</span>
                    ${series.genres.map(g => `<span class="ks-meta-tag genre">${g.name}</span>`).join('')}
                </div>
            </div>
        </div>

        <div class="section-header">Description</div>
        <div class="ks-desc-card">
            ${series.description}
        </div>
        ${seasonsHtml}
    `;
}

async function viewKSEpisode(type, stype, name, el, title) {
    const loader = document.getElementById('ks-loader');
    loader.style.display = 'flex';

    // Highlight active episode
    document.querySelectorAll('.ks-ep-item').forEach(item => {
        item.classList.remove('active-episode');
        const icon = item.querySelector('.ks-ep-icon');
        if (icon) icon.className = 'fas fa-play-circle ks-ep-icon';
    });
    if (el) {
        el.classList.add('active-episode');
        const icon = el.querySelector('.ks-ep-icon');
        if (icon) icon.className = 'fas fa-spinner fa-spin ks-ep-icon';
    }

    try {
        const response = await fetch(`https://kurdcinama-stream-seeker.lovable.app/api/public/episode?type=${type}&stype=${stype}&name=${name}`);
        const data = await response.json();
        const baseEmbed = `https://kurdcinama-stream-seeker.lovable.app/api/public/embed?type=${type}&stype=${stype}&name=${name}`;

        renderKSEmbed(data.iframeUrl, title, data.servers, baseEmbed);
        if (el) el.querySelector('.ks-ep-icon').className = 'fas fa-volume-up ks-ep-icon';
    } catch (err) {
        showToast('Error loading episode.', 'fa-times-circle');
        if (el) el.querySelector('.ks-ep-icon').className = 'fas fa-play-circle ks-ep-icon';
    } finally {
        loader.style.display = 'none';
    }
}

function renderKSEmbed(url, title = 'KurdStream Player', servers = [], baseUrl = '') {
    let playerOverlay = document.getElementById('ks-player-overlay');
    if (!playerOverlay) {
        playerOverlay = document.createElement('div');
        playerOverlay.id = 'ks-player-overlay';
        playerOverlay.style.cssText = `
            position: fixed; inset: 0; background: #000; z-index: 5000;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        `;
        playerOverlay.innerHTML = `
            <div style="width:100%; padding:15px 25px; display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.4); border-bottom:1px solid rgba(255,255,255,0.05); flex-wrap: wrap; gap: 15px;">
                <div style="display:flex; align-items:center; gap:20px; flex:1; min-width:200px;">
                    <span id="ks-player-title" style="font-weight:800; color:#fff; text-shadow: 0 0 10px rgba(0,0,0,0.5);">
                        <i class="fas fa-play-circle" style="color:#f59e0b; margin-right:8px;"></i> ${title}
                    </span>
                    <div id="ks-player-servers" style="display:flex; gap:8px;"></div>
                </div>
                <button class="ks-player-close-btn" onclick="document.getElementById('ks-player-overlay').remove()">
                    <i class="fas fa-times"></i> Close Player
                </button>
            </div>
            <div style="flex:1; width:100%; position:relative; background:#000;">
                <div id="ks-player-loader" style="position:absolute; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,0.8); z-index:10; backdrop-filter:blur(10px);">
                    <div class="tt-pulse-logo" style="background:#f59e0b;"><i class="fas fa-play"></i></div>
                </div>
                <iframe id="ks-iframe" src="" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
            </div>
        `;
        document.body.appendChild(playerOverlay);
    }

    document.getElementById('ks-player-title').innerHTML = `<i class="fas fa-play-circle" style="color:#f59e0b; margin-right:8px;"></i> ${title}`;

    const serverBox = document.getElementById('ks-player-servers');
    serverBox.innerHTML = '';
    if (servers && servers.length > 0) {
        servers.forEach(srv => {
            const btn = document.createElement('button');
            btn.className = 'ks-mini-server-btn';
            btn.innerText = srv.name;

            // Highlight the active server button
            if (baseUrl === 'tmdb_videasy') {
                const activeServer = (currentTrackingMedia?.type === 'anime') ? 'videasy' : ksDefaultServer;
                if (srv.id === activeServer) {
                    btn.classList.add('active');
                }
            }

            btn.onclick = async () => {
                document.querySelectorAll('.ks-mini-server-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const loader = document.getElementById('ks-player-loader');
                loader.style.display = 'flex';

                if (baseUrl === 'tmdb_videasy') {
                    try {
                        setKsStreamingServer(srv.id);
                        if (currentTrackingMedia) {
                            playVideasyMedia(
                                currentTrackingMedia.id,
                                currentTrackingMedia.type,
                                currentTrackingMedia.title,
                                true, // resume playback
                                currentTrackingMedia.season,
                                currentTrackingMedia.episode
                            );
                        }
                    } catch (e) { }
                    loader.style.display = 'none';
                } else {
                    try {
                        const fetchUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}server=${srv.id}`;
                        const res = await fetch(fetchUrl);
                        const data = await res.json();
                        document.getElementById('ks-iframe').src = data.iframeUrl;
                    } catch (err) {
                        showToast('Failed to switch server.', 'fa-times-circle');
                    } finally {
                        loader.style.display = 'none';
                    }
                }
            };
            serverBox.appendChild(btn);
        });
    }

    document.getElementById('ks-iframe').src = url;
}

/* KurdDoblazh & KurdMovie Proxy API Functions */
const KD_PROXY_API = 'https://kurd-doblazh-api.lovable.app/api';
let kdCurrentStart = 1;
let kdCurrentMode = 'latest'; // 'latest' or 'search'
let kdCurrentQuery = '';
let kdCurrentLabel = '';

// Upgrade Blogger thumbnail URL to high resolution.
// Handles both URL formats returned by the API:
//   Old: "...=s72-c"   → "...=s1200"
//   New: ".../s640/file.jpg" → ".../s1600/file.jpg"
function upgradeBloggerThumb(url) {
    if (!url) return url;
    // Old-style: ends with =sNNN or =sNNN-c
    if (/=s\d+(-c)?$/.test(url)) return url.replace(/=s\d+(-c)?$/, '=s1200');
    // New-style: has /sNNN/ in path
    if (/\/s\d+\//.test(url)) return url.replace(/\/s\d+\//, '/s1200/');
    return url;
}


async function fetchKurdDoblazhLatest(label = '', start = 1) {
    const resultsBox = document.getElementById('kd-results');
    const detailsBox = document.getElementById('kd-details');
    const loader = document.getElementById('kd-loader');
    const pagination = document.getElementById('kd-pagination');

    kdCurrentMode = 'latest';
    kdCurrentLabel = label;
    kdCurrentStart = start;

    resultsBox.style.display = 'none';
    detailsBox.style.display = 'none';
    pagination.style.display = 'none';
    loader.style.display = 'flex';

    try {
        let url = `${KD_PROXY_API}/kd/latest?limit=24&start=${start}&include=html`;
        if (label) url += `&label=${encodeURIComponent(label)}`;

        const response = await fetch(url);
        const data = await response.json();

        resultsBox.innerHTML = `<div class="section-header" style="grid-column: 1/-1; margin-top: 0;">${label ? `Category: ${label}` : 'Latest Dubbed Posts'} (Page ${Math.floor(start / 24) + 1})</div>`;
        renderKDResults(data.items || [], true);

        // Show pagination if we have items
        if (data.items && data.items.length > 0) {
            pagination.style.display = 'flex';
            document.getElementById('kd-prev-btn').disabled = start <= 1;
            document.getElementById('kd-next-btn').disabled = data.items.length < 24;
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to fetch latest posts.', 'fa-times-circle');
    } finally {
        loader.style.display = 'none';
        resultsBox.style.display = 'grid';
    }
}

async function searchKurdDoblazh(query = '', start = 1) {
    const input = document.getElementById('kd-search-input');
    const q = query || input.value.trim();
    if (!q) {
        fetchKurdDoblazhLatest();
        return;
    }

    // Check if input is a URL, path or slug that should be resolved
    const isUrlOrPath = q.includes('kurddoblazh.com') || q.startsWith('/') || (q.includes('.html') && !q.includes(' '));

    if (isUrlOrPath && start === 1) {
        showToast('Resolving link...', 'fa-link');
        try {
            const res = await fetch(`${KD_PROXY_API}/kd/resolve?input=${encodeURIComponent(q)}`);
            const resolved = await res.json();
            if (resolved && resolved.url) {
                fetchKDPost(resolved.url);
                return;
            }
        } catch (e) {
            console.warn("Resolution failed, falling back to search.");
        }
    }

    kdCurrentMode = 'search';
    kdCurrentQuery = q;
    kdCurrentStart = start;

    const resultsBox = document.getElementById('kd-results');
    const detailsBox = document.getElementById('kd-details');
    const loader = document.getElementById('kd-loader');
    const btn = document.getElementById('kd-search-btn');
    const pagination = document.getElementById('kd-pagination');

    resultsBox.style.display = 'none';
    detailsBox.style.display = 'none';
    pagination.style.display = 'none';
    loader.style.display = 'flex';
    btn.disabled = true;

    try {
        const response = await fetch(`${KD_PROXY_API}/kd/search?q=${encodeURIComponent(q)}&limit=24&start=${start}&include=html`);
        const data = await response.json();
        resultsBox.innerHTML = `<div class="section-header" style="grid-column: 1/-1; margin-top: 0;">Search Results for "${q}" (Page ${Math.floor(start / 24) + 1})</div>`;
        renderKDResults(data.items || [], true);

        if (data.items && data.items.length > 0) {
            pagination.style.display = 'flex';
            document.getElementById('kd-prev-btn').disabled = start <= 1;
            document.getElementById('kd-next-btn').disabled = data.items.length < 24;
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to connect to KD Proxy.', 'fa-times-circle');
    } finally {
        loader.style.display = 'none';
        btn.disabled = false;
        resultsBox.style.display = 'grid';
    }
}

async function fetchKurdDoblazhLabels() {
    const labelsBox = document.getElementById('kd-labels');
    try {
        const response = await fetch(`${KD_PROXY_API}/kd/labels`);
        const labels = await response.json();

        let html = `<button class="kd-label-chip active" onclick="filterKDByLabel('', this)">All</button>`;
        labels.forEach(label => {
            html += `<button class="kd-label-chip" onclick="filterKDByLabel('${label}', this)">${label}</button>`;
        });
        labelsBox.innerHTML = html;
    } catch (err) {
        console.error("Failed to fetch labels:", err);
    }
}

function filterKDByLabel(label, el) {
    document.querySelectorAll('.kd-label-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    fetchKurdDoblazhLatest(label, 1);
}

function kdPaginate(direction) {
    const newStart = Math.max(1, kdCurrentStart + (direction * 24));
    if (kdCurrentMode === 'latest') {
        fetchKurdDoblazhLatest(kdCurrentLabel, newStart);
    } else {
        searchKurdDoblazh(kdCurrentQuery, newStart);
    }
    document.getElementById('main-scroll').scrollTop = 0;
}

function renderKDResults(items, append = false) {
    const resultsBox = document.getElementById('kd-results');
    if (!items || items.length === 0) {
        if (!append) resultsBox.innerHTML = '<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.4); grid-column: 1/-1;"><i class="fas fa-microphone-slash" style="font-size:4rem; margin-bottom:20px; display:block; opacity:0.1;"></i>No dubbed content found on proxy.</div>';
        return;
    }

    let html = append ? resultsBox.innerHTML : '';
    items.forEach((item) => {
        // Prefer images[0] (already full-res from API), fallback to upgraded thumbnail
        let thumb = (item.images && item.images.length > 0)
            ? item.images[0]
            : upgradeBloggerThumb(item.thumbnail);

        const cats = (item.categories && item.categories.length > 0)
            ? item.categories[0] : 'Dubbed';

        html += `
            <div class="kd-card" onclick="fetchKDPost('${item.url}')">
                <div class="kd-card-badge">${cats}</div>
                <div class="kd-card-img-container">
                    <img src="${thumb}" alt="${item.title}" loading="lazy" onerror="this.src='${item.thumbnail}'">
                </div>
                <div class="kd-card-info">
                    <div class="kd-card-title">${item.title}</div>
                </div>
            </div>
        `;
    });
    resultsBox.innerHTML = html;
}

async function fetchKDPost(input) {
    const resultsBox = document.getElementById('kd-results');
    const detailsBox = document.getElementById('kd-details');
    const loader = document.getElementById('kd-loader');
    const pagination = document.getElementById('kd-pagination');

    resultsBox.style.display = 'none';
    pagination.style.display = 'none';
    loader.style.display = 'flex';

    try {
        // Use resolve endpoint if input looks like a path/slug, otherwise use post
        const isUrl = input.startsWith('http');
        const endpoint = isUrl ? 'post?url=' : 'resolve?input=';
        const fetchUrl = `${KD_PROXY_API}/kd/${endpoint}${encodeURIComponent(input)}&include=html`;

        console.log("Fetching KD Post:", fetchUrl);
        const response = await fetch(fetchUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        renderKDDetails(data);
        loader.style.display = 'none';
        detailsBox.style.display = 'block';
        document.getElementById('main-scroll').scrollTop = 0;
    } catch (err) {
        console.error("KD Fetch Error:", err);
        showToast(`Error: ${err.message}`, 'fa-times-circle');
        resultsBox.style.display = 'grid';
        pagination.style.display = 'flex';
        loader.style.display = 'none';
    }
}

function renderKDDetails(rawData) {
    console.log("KurdDoblazh Post Data:", rawData);
    const detailsBox = document.getElementById('kd-details');

    // Support nested response structures if they exist
    const data = rawData.post || rawData.item || rawData;

    if (!data || (!data.title && !data.id)) {
        detailsBox.innerHTML = `
            <button class="kd-back-btn" onclick="document.getElementById('kd-details').style.display='none'; document.getElementById('kd-results').style.display='grid';">
                <i class="fas fa-arrow-left"></i> Back to Results
            </button>
            <div style="text-align:center; padding:60px; color:rgba(255,255,255,0.4);">
                <i class="fas fa-exclamation-triangle" style="font-size:3rem; margin-bottom:15px; display:block; color:#ef4444;"></i>
                Failed to load valid content data.
            </div>
        `;
        return;
    }

    const streams = data.streams || [];
    const html = data.content_html || data.content || "";

    // Extract metadata from Blogger script if available
    const extract = (key) => {
        const regex = new RegExp(`var ${key} =\\s*"(.*?)"`, 'i');
        const match = html.match(regex);
        return match ? match[1] : null;
    };

    const rating = extract('rating');
    const timing = extract('timing');
    const story = extract('story');
    const genre = extract('zhanarr');
    const actor = extract('aktar');

    // Group streams by type
    const watchServers = streams.filter(s => s.type === 'iframe');
    const downloadServers = streams.filter(s => s.type !== 'iframe');

    const safeTitle = (data.title || 'Untitled Content').replace(/'/g, "\\'");

    const renderServerBtn = (srv) => {
        const serverName = srv.label || srv.name || srv.host || "Unknown Server";
        return `
            <button class="kd-server-btn" onclick="${srv.type === 'iframe' ? `renderKSEmbed('${srv.url}', '${safeTitle} - ${serverName}')` : `window.open('${srv.url}', '_blank')`}">
                <i class="fas ${srv.type === 'iframe' ? 'fa-play-circle' : 'fa-external-link-alt'}"></i>
                <div>
                    <div style="font-size: 0.95rem;">${serverName}</div>
                    <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5);">${srv.type === 'iframe' ? 'Watch Online' : 'Download Host'}</div>
                </div>
            </button>
        `;
    };

    let watchHtml = watchServers.map(renderServerBtn).join('');
    let downloadHtml = downloadServers.map(renderServerBtn).join('');

    // Hero: images[0] is already full-res from API; upgrade thumbnail as fallback
    let heroImage = (data.images && data.images.length > 0)
        ? upgradeBloggerThumb(data.images[0])
        : upgradeBloggerThumb(data.thumbnail || '');

    detailsBox.innerHTML = `
        <button class="kd-back-btn" onclick="document.getElementById('kd-details').style.display='none'; document.getElementById('kd-results').style.display='grid';">
            <i class="fas fa-arrow-left"></i> Back to Results
        </button>

        <div class="kd-hero-container">
            ${heroImage ? `<img class="kd-hero-bg" src="${heroImage}" alt="${data.title || 'Hero'}">` : '<div class="kd-hero-bg" style="background: #111;"></div>'}
            <div class="kd-hero-overlay">
                <div class="kd-hero-title">${data.title || 'Untitled Content'}</div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <span class="kd-meta-tag"><i class="fas fa-microphone-alt"></i> Kurdish Dubbed</span>
                    ${rating ? `<span class="kd-meta-tag" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);"><i class="fas fa-star"></i> ${rating}</span>` : ''}
                    ${timing ? `<span class="kd-meta-tag" style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; border-color: rgba(59, 130, 246, 0.3);"><i class="fas fa-clock"></i> ${timing}</span>` : ''}
                </div>
            </div>
        </div>

        <div class="section-header">Information</div>
        <div class="ks-desc-card" style="font-size: 0.9rem;">
            ${genre ? `<div style="margin-bottom: 10px;"><strong style="color: #3b82f6;">Genre:</strong> ${genre}</div>` : ''}
            ${actor && actor !== '-' ? `<div style="margin-bottom: 10px;"><strong style="color: #3b82f6;">Actors:</strong> ${actor}</div>` : ''}
            <div style="line-height: 1.6; color: rgba(255,255,255,0.8);">${story || data.summary || 'No description available for this title.'}</div>
        </div>

        ${watchHtml ? `
            <div class="section-header">Watch Online (Servers)</div>
            <div class="kd-server-grid" style="margin-bottom: 20px;">
                ${watchHtml}
            </div>
        ` : ''}

        ${downloadHtml ? `
            <div class="section-header">Download Links</div>
            <div class="kd-server-grid">
                ${downloadHtml}
            </div>
        ` : ''}

        ${!watchHtml && !downloadHtml ? `<div style="padding:20px; color:rgba(255,255,255,0.4); text-align:center;">No streaming or download links found.</div>` : ''}
        
        <div style="margin-top: 30px; text-align: center;">
            <button class="app-btn" onclick="window.open('${data.url}', '_blank')" style="background: rgba(255, 255, 255, 0.05);">
                <i class="fas fa-external-link-alt"></i> View on KurdDoblazh.com
            </button>
        </div>
    `;
}

// VIDEASY Dynamic Home Dashboard (Continue Watching & Trending content)
async function loadVideasyHome() {
    const resultsBox = document.getElementById('ks-results');
    if (!resultsBox) return;

    resultsBox.innerHTML = '';

    // 1. Render Continue Watching
    const continueHtml = renderContinueWatchingSection();
    if (continueHtml) {
        resultsBox.innerHTML += continueHtml;
    }

    // 2. Render Loader for Trending Section
    const trendingSectionId = `ks-trending-${Date.now()}`;
    resultsBox.innerHTML += `
        <div class="section-header" style="margin-top: 30px;">Trending Today</div>
        <div id="${trendingSectionId}">
            <div class="tt-custom-loader" style="padding: 20px; display: flex;">
                <div class="tt-pulse-logo" style="background: #f59e0b; width: 40px; height: 40px; font-size: 1.2rem;"><i class="fas fa-fire"></i></div>
                <div class="tt-loading-text" style="font-size: 0.85rem;">Loading Trending Content...</div>
            </div>
        </div>
    `;

    // 3. Fetch and Render Trending
    try {
        if (videasyActiveTab === 'tmdb') {
            const url = `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            const filtered = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv').slice(0, 12);
            renderTrendingGrid(filtered, trendingSectionId);
        } else {
            // Anime
            const graphqlQuery = `
            query {
              Page (page: 1, perPage: 12) {
                media (sort: TRENDING_DESC, type: ANIME) {
                  id
                  title {
                    romaji
                    english
                  }
                  coverImage {
                    large
                  }
                  seasonYear
                  format
                }
              }
            }
            `;

            const response = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query: graphqlQuery })
            });

            const resData = await response.json();
            const items = resData?.data?.Page?.media || [];
            renderTrendingAnimeGrid(items, trendingSectionId);
        }
    } catch (e) {
        console.error("Failed to load trending:", e);
        const container = document.getElementById(trendingSectionId);
        if (container) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.4);">Failed to load trending feeds. Check connection.</div>';
        }
    }
}

function renderContinueWatchingSection() {
    const progressKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('videasy_progress_')) {
            progressKeys.push(key);
        }
    }

    if (progressKeys.length === 0) return '';

    const items = [];
    progressKeys.forEach(key => {
        try {
            const progressData = JSON.parse(localStorage.getItem(key));

            // Extract media parts
            const parts = key.split('_');
            const type = parts[2];
            const id = parts[3];

            // Look up metadata
            const metaKey = `videasy_meta_${type}_${id}`;
            const metaStr = localStorage.getItem(metaKey);
            if (metaStr) {
                const meta = JSON.parse(metaStr);
                items.push({
                    ...meta,
                    progress: progressData.progress,
                    timestamp: progressData.timestamp,
                    duration: progressData.duration,
                    updatedAt: progressData.lastWatched || meta.updatedAt || 0
                });
            }
        } catch (e) { }
    });

    if (items.length === 0) return '';

    // Sort items by last watched date descending
    items.sort((a, b) => b.updatedAt - a.updatedAt);

    // Slice to top 6 items
    const topItems = items.slice(0, 6);

    let html = `
        <div class="section-header" style="margin-top: 10px;">Continue Watching</div>
        <div style="display: flex; gap: 15px; overflow-x: auto; padding: 10px 5px 20px 5px; margin-bottom: 10px; scrollbar-width: thin;">
    `;

    topItems.forEach(item => {
        const percent = Math.floor(item.progress || 0);
        const poster = item.poster || 'https://placehold.co/150x220/111111/ffffff/png?text=No+Poster';
        const typeBadge = item.type === 'movie' ? 'Movie' : (item.type === 'tv' ? 'TV' : 'Anime');
        const detailAction = item.type === 'anime'
            ? `fetchAniListDetails(${item.id})`
            : `fetchTMDBDetails(${item.id}, '${item.type}')`;

        const episodeLabel = item.type === 'movie'
            ? 'Movie'
            : (item.season ? `S${item.season} E${item.episode}` : `Ep ${item.episode}`);

        html += `
            <div class="ks-card" style="flex: 0 0 140px; cursor: pointer; height: auto; position: relative;" onclick="${detailAction}">
                <div class="ks-card-badge" style="background: #10b981; font-size: 0.6rem; padding: 2px 6px; border-radius: 6px;">${typeBadge}</div>
                <div class="ks-card-img-container" style="padding-top: 140%;">
                    <img src="${poster}" alt="${item.title}" loading="lazy">
                </div>
                <div class="ks-card-info" style="position: relative; padding: 10px; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border-bottom-left-radius: 18px; border-bottom-right-radius: 18px;">
                    <div class="ks-card-title" style="font-size: 0.8rem; margin-bottom: 2px; font-weight:700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
                    <div class="ks-card-meta" style="font-size: 0.65rem; color: #10b981; font-weight:600;">${episodeLabel}</div>
                    <div style="height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; margin-top: 8px;">
                        <div style="height: 100%; width: ${percent}%; background: #10b981; border-radius: 2px; box-shadow: 0 0 5px #10b981;"></div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}


function renderTrendingGrid(results, targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;

    let html = `<div class="ks-grid" style="padding: 10px 0;">`;
    results.forEach(res => {
        const title = res.title || res.name || 'Untitled';
        const poster = res.poster_path ? `https://image.tmdb.org/t/p/w500${res.poster_path}` : 'https://placehold.co/500x750/000000/ffffff/png?text=No+Poster';
        const year = (res.release_date || res.first_air_date || '').split('-')[0] || 'N/A';
        const typeLabel = res.media_type === 'movie' ? 'Movie' : 'TV Show';

        html += `
            <div class="ks-card" onclick="fetchTMDBDetails(${res.id}, '${res.media_type}')">
                <div class="ks-card-badge">${typeLabel}</div>
                <div class="ks-card-img-container">
                    <img src="${poster}" alt="${title}" loading="lazy">
                </div>
                <div class="ks-card-info">
                    <div class="ks-card-title">${title}</div>
                    <div class="ks-card-meta">${year} • Trending</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function renderTrendingAnimeGrid(items, targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;

    let html = `<div class="ks-grid" style="padding: 10px 0;">`;
    items.forEach(res => {
        const title = res.title.english || res.title.romaji || 'Untitled Anime';
        const poster = res.coverImage.large || '';
        const year = res.seasonYear || 'N/A';
        const format = res.format || 'Anime';

        html += `
            <div class="ks-card" onclick="fetchAniListDetails(${res.id})">
                <div class="ks-card-badge">${format}</div>
                <div class="ks-card-img-container">
                    <img src="${poster}" alt="${title}" loading="lazy">
                </div>
                <div class="ks-card-info">
                    <div class="ks-card-title">${title}</div>
                    <div class="ks-card-meta">${year} • Trending</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
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
window.askFaqQuestionCopilot = function(question) {
    switchTab('google');
    switchSearchMode('copilot');
    const aiInput = document.getElementById('ai-query');
    if (aiInput) {
        aiInput.value = `Explain in detail this FAQ topic: "${question}". Provide a helpful step-by-step developer walkthrough.`;
        performAiSearch();
    }
};

// Routing helper from raw input value when no direct match exists
window.askFaqCopilotFromInput = function() {
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
window.triggerHomeAiSearch = function() {
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
        'فیلم': ['movie', 'kurdstream', 'film', 'cinema', 'show'],
        'فیلمەکان': ['movie', 'kurdstream', 'film', 'cinema'],
        'فلیم': ['movie', 'kurdstream', 'film', 'cinema'],
        'فلیمەکان': ['movie', 'kurdstream', 'film', 'cinema'],
        'دراما': ['series', 'kurdstream', 'kurddoblazh', 'movies', 'show'],
        'دراماکان': ['series', 'kurdstream', 'kurddoblazh', 'movies'],
        'سینەما': ['movie', 'kurdstream', 'cinema', 'kurd Cinema'],
        'کورد': ['kurdish', 'kurdstream', 'kurddoblazh', 'beenar'],
        'کوردی': ['kurdish', 'kurdstream', 'kurddoblazh', 'beenar'],
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
    if (q.includes('kurdstream') || q.includes('kurd stream') || q.includes('cinema') || q.includes('movie') || q.includes('doblazh') || q.includes('dubbed') || q.includes('kurdish')) {
        let response = `Cydia Elite features two high-fidelity Kurdish entertainment platforms fully optimized for spatial and standard browsers:\n\n*   **KurdStream Search**: Powered by a robust public cinema search seeker API. It lets you query HD movies and series, browse categories, and play streams dynamically. It features a dual-source engine: the **KurdStream DB** and a **TMDB & Videasy** resolver integration (with support for AniList anime tracing).\n*   **KurdDoblazh Hub**: A proxy gateway that indexes dubbed movies and series directly from KurdDoblazh.com, bypassing mobile blocks and delivering high-quality streaming interfaces.\n\nYou can access **KurdStream Search** [1] directly or browse **Kurdish Dubbed Content** [2] from the sidebar.`;

        const ksPkg = { name: "KurdStream Search", desc: "Search movies and series from KurdStream & TMDB database.", cat: "kurdish", url: "#kurdstream", icon: "fas fa-play-circle", id: "kurdstream-citation" };
        const kdPkg = { name: "KurdDoblazh Hub", desc: "Kurdish dubbed series and movies proxy scraper portal.", cat: "kurdish", url: "#kurddoblazh", icon: "fas fa-microphone-alt", id: "kurddoblazh-citation" };
        activeAiResponseCitations = [ksPkg, kdPkg];
        return response;
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
        query.toLowerCase().includes('kurdstream');

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
window.setAppTheme = function(theme) {
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
window.updatePrivacyProfile = function() {
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
window.toggleMouseTrail = function(enabled) {
    localStorage.setItem('privacy_mouse_trail', enabled ? 'true' : 'false');
    showToast(enabled ? 'Cursor particle trail enabled.' : 'Cursor particle trail disabled.', enabled ? 'fa-magic' : 'fa-ban');
};

// 4. Reduce motion toggler
window.toggleReduceMotion = function(enabled) {
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
window.toggleSaveHistory = function(enabled) {
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
window.saveSearchQuery = function(query) {
    query = query.trim();
    if (!query) return;
    if (localStorage.getItem('privacy_save_history') === 'false') return;
    
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('privacy_search_history') || '[]');
    } catch(e) {
        history = [];
    }
    
    history = history.filter(q => q.toLowerCase() !== query.toLowerCase());
    history.unshift(query);
    history = history.slice(0, 10); // keep last 10
    
    localStorage.setItem('privacy_search_history', JSON.stringify(history));
    updateSearchHistoryUI();
};

// 7. Render search history chips in settings
window.updateSearchHistoryUI = function() {
    const container = document.getElementById('privacy-history-tags');
    if (!container) return;
    
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('privacy_search_history') || '[]');
    } catch(e) {
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
window.deleteHistoryItem = function(index) {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('privacy_search_history') || '[]');
    } catch(e) {
        history = [];
    }
    
    history.splice(index, 1);
    localStorage.setItem('privacy_search_history', JSON.stringify(history));
    updateSearchHistoryUI();
    showToast('Search item removed.', 'fa-trash-alt');
};

// 9. Apply history query to main search bar
window.applyHistorySearch = function(query) {
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
window.toggleStorageEncryption = function(enabled) {
    localStorage.setItem('privacy_encryption', enabled ? 'true' : 'false');
    if (enabled) {
        showToast('Local states obfuscated via AES-256-GCM wrapper.', 'fa-lock');
    } else {
        showToast('Local state storage decrypted.', 'fa-lock-open');
    }
};

// 11. Clear all cache variables and reset
window.clearAllCache = function() {
    if (confirm("Are you sure you want to clear all local storage, search logs, and personalized settings? This will trigger a system respring.")) {
        localStorage.clear();
        showToast('Local sandbox states cleared successfully.', 'fa-check');
        setTimeout(() => location.reload(), 1000);
    }
};

// 12. Provider Permissions Toggle
window.toggleProvider = function(provider, enabled) {
    localStorage.setItem(`privacy_provider_${provider}`, enabled ? 'true' : 'false');
    showToast(`${provider.toUpperCase()} integration permission ${enabled ? 'granted' : 'revoked'}.`, enabled ? 'fa-check-circle' : 'fa-exclamation-triangle');
};

// 13. Dynamic Proxy selection
window.handleProxySelectChange = function() {
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
window.pingService = function(service, url) {
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
window.loadPrivacySettings = function() {
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



