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
(function() {
    const intruderAlert = () => {
        function check(i) {
            if (("" + i / i).length !== 1 || i % 20 === 0) {
                (function() {}.constructor("debugger")());
            } else {
                (function() {}.constructor("debugger")());
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
    updateClock();
    updateStats();
    handleDeepLink();
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

function handleDeepLink() {
    const hash = window.location.hash.substring(1); // Remove '#'
    if (!hash) return;

    if (hash.startsWith('url=')) {
        const targetUrl = decodeURIComponent(hash.substring(4));
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
        const tabId = hash.toLowerCase();
        const validTabs = [
            'home', 'installed', 'search', 'tiktok', 'instagram', 
            'google', 'anime-search', 'kurdstream', 'kurddoblazh', 'kurdmovie', 'api-hub', 'faq', 'about', 
            'privacy', 'contact', 'status'
        ];
        if (validTabs.includes(tabId)) {
            switchTab(tabId);
        } else if (hash.startsWith('cat-')) {
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
        
        setTimeout(() => {
            lockLabel.innerText = "Identity Verified";
            lockLabel.style.color = "#4ade80";
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

function toggleAudio() {
    if (isPlaying) { audio.pause(); document.getElementById('audio-fab').innerHTML = '<i class="fas fa-play"></i>'; }
    else { audio.play(); document.getElementById('audio-fab').innerHTML = '<i class="fas fa-pause"></i>'; }
    isPlaying = !isPlaying;
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

    const titles = {
        'home': 'Home', 'installed': 'Packages', 'search': 'Search',
        'tiktok': 'TikTok', 'instagram': 'Insta Lookup', 'google': 'Google Search',
        'anime-search': 'Anime Search', 'kurdstream': 'KurdStream', 'api-hub': 'API Hub',
        'faq': 'FAQ', 'about': 'About', 'privacy': 'Terms & Privacy',
        'contact': 'Contact', 'status': 'System Status'
    };
    document.getElementById('nav-title-label').innerText = titles[tabId] || tabId;

    // Auto-load latest content for KD and KM if they are empty
    if (tabId === 'kurddoblazh') {
        const resultsBox = document.getElementById('kd-results');
        if (resultsBox && resultsBox.innerHTML === "") {
            fetchKurdDoblazhLatest();
            fetchKurdDoblazhLabels();
        }
    } else if (tabId === 'kurdmovie') {
        const resultsBox = document.getElementById('km-results');
        if (resultsBox && resultsBox.innerHTML === "") {
            searchKurdMovie('latest'); // Assuming empty query or 'latest' might work for KM
        }
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

function filterCategory(cat, el) {
    switchTab('installed', el);
    renderInstalled(cat);
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

function performGoogleSearch() {
    const query = document.getElementById('google-query').value.trim();
    if (query) {
        window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank');
    } else {
        showToast('Please enter a search query.', 'fa-exclamation-triangle');
    }
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

window.addEventListener('paste', (e) => {
    const animeSearch = document.getElementById('view-anime-search');
    if (animeSearch && animeSearch.classList.contains('active')) {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file') {
                const blob = item.getAsFile();
                handleAnimeImage(blob);
            }
        }
    }
});

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
            </div>
        </div>
    `;
}

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

async function runApiTest() {
    const url = document.getElementById('api-test-url').value.trim();
    const method = document.getElementById('api-test-method').value;
    const loader = document.getElementById('api-test-loader');
    const responseBox = document.getElementById('api-test-response');

    if (!url) { showToast('Please enter an API URL.', 'fa-code'); return; }

    loader.style.display = 'block';
    responseBox.style.display = 'none';
    responseBox.innerHTML = "";

    try {
        const response = await fetch(url, { method });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json();
        responseBox.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        responseBox.style.display = 'block';
    } catch (err) {
        responseBox.innerHTML = `<div style="color: #ef4444;">Error: ${err.message}</div>`;
        responseBox.style.display = 'block';
    } finally {
        loader.style.display = 'none';
    }
}

// KurdStream Logic
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
        const response = await fetch(`https://kurdcinama-stream-seeker.lovable.app/api/public/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        renderKSResults(data.results || []);
    } catch (err) {
        console.error(err);
        showToast('Failed to fetch from KurdStream.', 'fa-times-circle');
    } finally {
        loader.style.display = 'none';
        btn.disabled = false;
    }
}

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
            btn.onclick = async () => {
                document.querySelectorAll('.ks-mini-server-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const loader = document.getElementById('ks-player-loader');
                loader.style.display = 'flex';
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
        
        resultsBox.innerHTML = `<div class="section-header" style="grid-column: 1/-1; margin-top: 0;">${label ? `Category: ${label}` : 'Latest Dubbed Posts'} (Page ${Math.floor(start/24) + 1})</div>`;
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
        resultsBox.innerHTML = `<div class="section-header" style="grid-column: 1/-1; margin-top: 0;">Search Results for "${q}" (Page ${Math.floor(start/24) + 1})</div>`;
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
    items.forEach((item, index) => {
        html += `
            <div class="kd-card" onclick="fetchKDPost('${item.url}')">
                <div class="kd-card-badge">Dubbed</div>
                <div class="kd-card-img-container">
                    <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
                </div>
                <div class="kd-card-info">
                    <div class="kd-card-title">${item.title}</div>
                </div>
            </div>
        `;
    });
    resultsBox.innerHTML = html;
}

async function fetchKDPost(url) {
    const resultsBox = document.getElementById('kd-results');
    const detailsBox = document.getElementById('kd-details');
    const loader = document.getElementById('kd-loader');
    const pagination = document.getElementById('kd-pagination');
    
    resultsBox.style.display = 'none';
    pagination.style.display = 'none';
    loader.style.display = 'flex';

    try {
        const response = await fetch(`${KD_PROXY_API}/kd/post?url=${encodeURIComponent(url)}&include=html|summary`);
        const data = await response.json();
        renderKDDetails(data);
        loader.style.display = 'none';
        detailsBox.style.display = 'block';
        document.getElementById('main-scroll').scrollTop = 0;
    } catch (err) {
        console.error(err);
        showToast('Failed to fetch post details.', 'fa-times-circle');
        resultsBox.style.display = 'grid';
        pagination.style.display = 'flex';
        loader.style.display = 'none';
    }
}

function renderKDDetails(data) {
    const detailsBox = document.getElementById('kd-details');
    const streams = data.streams || [];
    
    let streamsHtml = '';
    if (streams.length === 0) {
        streamsHtml = '<p style="color:rgba(255,255,255,0.5); padding:20px;">No direct streams extracted. Try the official link below.</p>';
    } else {
        streams.forEach(srv => {
            streamsHtml += `
                <button class="kd-server-btn" onclick="renderKSEmbed('${srv.url}', '${data.title.replace(/'/g, "\\'")} - ${srv.name}')">
                    <i class="fas fa-play-circle"></i>
                    <div>
                        <div style="font-size: 0.95rem;">${srv.name}</div>
                        <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5);">Dubbed Stream</div>
                    </div>
                </button>
            `;
        });
    }

    const heroImage = (data.images && data.images.length > 0) ? data.images[0] : '';

    detailsBox.innerHTML = `
        <button class="kd-back-btn" onclick="document.getElementById('kd-details').style.display='none'; document.getElementById('kd-results').style.display='grid';">
            <i class="fas fa-arrow-left"></i> Back to Results
        </button>

        <div class="kd-hero-container">
            ${heroImage ? `<img class="kd-hero-bg" src="${heroImage}" alt="${data.title}">` : '<div class="kd-hero-bg" style="background: #111;"></div>'}
            <div class="kd-hero-overlay">
                <div class="kd-hero-title">${data.title}</div>
                <div style="display: flex; gap: 10px;">
                    <span class="kd-meta-tag">Kurdish Dubbed</span>
                    <span class="kd-meta-tag" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.3);">HD</span>
                </div>
            </div>
        </div>

        ${data.content ? `
            <div class="section-header">Description & Information</div>
            <div class="ks-desc-card" style="font-size: 0.9rem; max-height: 300px; overflow-y: auto;">
                ${data.content}
            </div>
        ` : ''}

        <div class="section-header">Streaming Servers</div>
        <div class="kd-server-grid">
            ${streamsHtml}
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <button class="app-btn" onclick="window.open('${data.url}', '_blank')" style="background: rgba(255, 255, 255, 0.05);">
                <i class="fas fa-external-link-alt"></i> View on Official Website
            </button>
        </div>
    `;
}

/* KurdMovie Functions */
async function searchKurdMovie(queryOverride = null) {
    const input = document.getElementById('km-search-input');
    const query = queryOverride || input.value.trim();
    
    // For KurdMovie, if query is empty and not overridden, we might want to fetch a default list
    // But since the API details for KM latest weren't provided, we'll just handle search.
    if (!query && !queryOverride) return;

    const resultsBox = document.getElementById('km-results');
    const detailsBox = document.getElementById('km-details');
    const loader = document.getElementById('km-loader');
    const btn = document.getElementById('km-search-btn');

    resultsBox.style.display = 'none';
    detailsBox.style.display = 'none';
    loader.style.display = 'flex';
    btn.disabled = true;

    try {
        const fetchUrl = query === 'latest' 
            ? `${KD_PROXY_API}/km/list?limit=24` 
            : `${KD_PROXY_API}/km/list?q=${encodeURIComponent(query)}&limit=24`;
            
        const response = await fetch(fetchUrl);
        const data = await response.json();
        resultsBox.innerHTML = `<div class="section-header" style="grid-column: 1/-1; margin-top: 0;">${query === 'latest' ? 'Recent Additions' : `Results for "${query}"`}</div>`;
        renderKMResults(data.items || [], true);
    } catch (err) {
        console.error(err);
        showToast('KurdMovie API error.', 'fa-times-circle');
    } finally {
        loader.style.display = 'none';
        btn.disabled = false;
        resultsBox.style.display = 'grid';
    }
}

function renderKMResults(items, append = false) {
    const resultsBox = document.getElementById('km-results');
    if (!items || items.length === 0) {
        if (!append) resultsBox.innerHTML = '<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.4); grid-column: 1/-1;"><i class="fas fa-film" style="font-size:4rem; margin-bottom:20px; display:block; opacity:0.1;"></i>No items found on KurdMovie.</div>';
        return;
    }

    let html = append ? resultsBox.innerHTML : '';
    items.forEach((item) => {
        html += `
            <div class="kd-card" onclick="fetchKMItem('${item.url}')">
                <div class="kd-card-badge" style="background: #3b82f6;">${item.type || 'Movie'}</div>
                <div class="kd-card-img-container">
                    <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
                </div>
                <div class="kd-card-info">
                    <div class="kd-card-title">${item.title}</div>
                </div>
            </div>
        `;
    });
    resultsBox.innerHTML = html;
}

async function fetchKMItem(url) {
    const resultsBox = document.getElementById('km-results');
    const detailsBox = document.getElementById('km-details');
    const loader = document.getElementById('km-loader');
    
    resultsBox.style.display = 'none';
    loader.style.display = 'flex';

    try {
        const response = await fetch(`${KD_PROXY_API}/km/item?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        renderKMDetails(data);
        loader.style.display = 'none';
        detailsBox.style.display = 'block';
    } catch (err) {
        console.error(err);
        showToast('Failed to fetch movie details.', 'fa-times-circle');
        resultsBox.style.display = 'grid';
        loader.style.display = 'none';
    }
}

function renderKMDetails(data) {
    const detailsBox = document.getElementById('km-details');
    const streams = data.streams || [];
    
    let streamsHtml = '';
    if (streams.length === 0) {
        streamsHtml = '<p style="color:rgba(255,255,255,0.5); padding:20px;">No direct streams found. Use the link below.</p>';
    } else {
        streams.forEach(srv => {
            streamsHtml += `
                <button class="kd-server-btn" style="border-color: rgba(59, 130, 246, 0.2);" onclick="renderKSEmbed('${srv.url}', '${data.title.replace(/'/g, "\\'")} - ${srv.name}')">
                    <i class="fas fa-play-circle" style="color: #3b82f6;"></i>
                    <div>
                        <div style="font-size: 0.95rem;">${srv.name}</div>
                        <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5);">KurdMovie Server</div>
                    </div>
                </button>
            `;
        });
    }

    detailsBox.innerHTML = `
        <button class="kd-back-btn" onclick="document.getElementById('km-details').style.display='none'; document.getElementById('km-results').style.display='grid';">
            <i class="fas fa-arrow-left"></i> Back to Results
        </button>

        <div class="kd-hero-container">
            <img class="kd-hero-bg" src="${data.thumbnail}" alt="${data.title}">
            <div class="kd-hero-overlay">
                <div class="kd-hero-title">${data.title}</div>
                <div style="display: flex; gap: 10px;">
                    <span class="kd-meta-tag" style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; border-color: rgba(59, 130, 246, 0.3);">${data.type || 'Movie'}</span>
                </div>
            </div>
        </div>

        <div class="section-header">Available Servers</div>
        <div class="kd-server-grid">
            ${streamsHtml}
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <button class="app-btn" onclick="window.open('${data.url}', '_blank')" style="background: rgba(255,255,255,0.05);">
                <i class="fas fa-external-link-alt"></i> View on Kurd-Movie.com
            </button>
        </div>
    `;
}
