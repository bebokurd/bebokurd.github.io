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
        setTimeout(() => d.classList.add('visible'), i * 300);
    });
    renderInstalled();
    updateClock();
    updateStats();
};

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
                }, 800);
            }, 1000);
        }, 2500);
    }, 800);
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

    const titles = {
        'home': 'Home', 'installed': 'Packages', 'search': 'Search',
        'tiktok': 'TikTok', 'instagram': 'Insta Lookup', 'google': 'Google Search',
        'anime-search': 'Anime Search', 'api-hub': 'API Hub',
        'faq': 'FAQ', 'about': 'About', 'privacy': 'Terms & Privacy',
        'contact': 'Contact', 'status': 'System Status'
    };
    document.getElementById('nav-title-label').innerText = titles[tabId] || tabId;
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

    for (const [key, label] of Object.entries(categories)) {
        if (filterCat && filterCat !== key) continue;
        const items = packageData.filter(p => p.cat === key);
        if (items.length === 0) continue;

        container.innerHTML += `<div class="section-header">${label}</div><div class="detail-group cat-${key}">`;
        items.forEach(pkg => {
            const iconClass = pkg.icon.startsWith('fa-') ? 'fas' : 'fab';
            if (pkg.cmd) {
                const safeCmd = pkg.cmd.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                container.innerHTML += `
                    <a href="#" onclick="navigator.clipboard.writeText('${safeCmd}'); alert('Command copied to clipboard! Paste it in PowerShell.'); event.preventDefault();" class="pkg-list-item">
                        <div class="pkg-list-icon"><i class="${iconClass} ${pkg.icon}"></i></div>
                        <div class="pkg-list-info"><span class="pkg-list-name">${pkg.name}</span><span class="pkg-list-desc" style="color:#007aff; font-family:monospace; font-size:0.75rem;">[Click to Copy Command]</span></div>
                        <span class="chevron"><i class="fas fa-copy" style="font-size:0.9rem; color:#888;"></i></span>
                    </a>`;
            } else {
                container.innerHTML += `
                    <a href="${pkg.url}" target="_blank" class="pkg-list-item">
                        <div class="pkg-list-icon"><i class="${iconClass} ${pkg.icon}"></i></div>
                        <div class="pkg-list-info"><span class="pkg-list-name">${pkg.name}</span><span class="pkg-list-desc">${pkg.desc}</span></div>
                        <span class="chevron">›</span>
                    </a>`;
            }
        });
        container.innerHTML += `</div>`;
    }
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
        rc.innerHTML = `<div class="section-header">Found ${results.length} results</div><div class="detail-group">`;
        results.forEach(pkg => {
            const iconClass = pkg.icon.startsWith('fa-') ? 'fas' : 'fab';
            if (pkg.cmd) {
                const safeCmd = pkg.cmd.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                rc.innerHTML += `
                    <a href="#" onclick="navigator.clipboard.writeText('${safeCmd}'); alert('Command copied!'); event.preventDefault();" class="pkg-list-item">
                        <div class="pkg-list-icon"><i class="${iconClass} ${pkg.icon}"></i></div>
                        <div class="pkg-list-info"><span class="pkg-list-name">${pkg.name}</span><span class="pkg-list-desc">Copy Command</span></div>
                        <span class="chevron"><i class="fas fa-copy"></i></span>
                    </a>`;
            } else {
                rc.innerHTML += `
                    <a href="${pkg.url}" target="_blank" class="pkg-list-item">
                        <div class="pkg-list-icon"><i class="${iconClass} ${pkg.icon}"></i></div>
                        <div class="pkg-list-info"><span class="pkg-list-name">${pkg.name}</span><span class="pkg-list-desc">${pkg.desc}</span></div>
                        <span class="chevron">›</span>
                    </a>`;
            }
        });
        rc.innerHTML += `</div>`;
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
        alert("Please enter a search query.");
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
        alert("Please upload an image file.");
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
    if (!url) { alert("Please enter an image URL."); return; }
    
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
        alert("Error: " + err.message);
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

    if (!url) { alert("Please input a valid URL."); return; }

    resultBox.classList.remove('visible');
    loader.style.display = 'flex';
    fetchBtn.disabled = true;

    const baseApi = "https://v0-tik-tok-downloader-design.vercel.app/api/download";
    const targetUrl = `${baseApi}?url=${encodeURIComponent(url)}&quality=hd&format=mp4`;

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
        } catch (e) { console.warn("Direct fetch failed, trying Proxy 1..."); }

        // 2. Try Proxy 1 (corsproxy.io) - PC Only
        if (!fetchSuccess && !isMobileDevice()) {
            try {
                const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
                if (response.ok) {
                    data = await response.json();
                    fetchSuccess = true;
                }
            } catch (e) { console.warn("Proxy 1 failed, trying Proxy 2..."); }
        }

        // 3. Try Proxy 2 (allorigins.win)
        if (!fetchSuccess) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`);
                const proxyData = await response.json();
                if (proxyData.contents) {
                    data = JSON.parse(proxyData.contents);
                    fetchSuccess = true;
                }
            } catch (e) { console.warn("Proxy 2 failed."); }
        }

        if (!fetchSuccess) throw new Error("All fetch attempts failed (CORS/Network)");

        if (data && (data.msg === 'success' || data.code === 0 || data.success)) {
            renderTikTokResult(data.data || data);
        } else {
            throw new Error(data ? (data.msg || data.error || "API error") : "No data received");
        }
    } catch (err) {
        console.error("TikTok Fetch Error:", err);
        alert("Failed to fetch media: " + err.message);
    } finally {
        loader.style.display = 'none';
        fetchBtn.disabled = false;
    }
}

function renderTikTokResult(data) {
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
    if (!actionBtns && defaultUrl) {
        actionBtns = `<button class="app-btn" onclick="handleDownload('${defaultUrl}', '${finalFileName}', this)"><i class="fas fa-download"></i> Download Video</button>`;
    }

    const qualityBadge = data.quality ? `<span style="background: linear-gradient(135deg, #69C9D0, #EE1D52); color: #fff; padding: 4px 14px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; margin-left: 10px; vertical-align: middle; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 0 15px rgba(105, 201, 208, 0.3); text-transform: uppercase;">${data.quality}</span>` : '';

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
                <button class="app-btn" onclick="navigator.clipboard.writeText('${defaultUrl}'); alert('Direct video link copied!');" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); margin-top: 10px; width: 100%;">
                    <i class="fas fa-link"></i> Copy Source URL
                </button>
            </div>
        </div>
    `;
    resultBox.classList.add('visible');
}

async function handleDownload(url, filename, btn) {
    if (!url) { alert("Download URL not found."); return; }
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network error');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl; a.download = filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        window.open(url, '_blank');
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

    if (!query) { alert("Please input a valid username."); return; }

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
        } catch (e) { console.warn("Instagram direct failed, trying proxy 1..."); }

        // 2. Try Proxy 1 (corsproxy.io) - PC Only
        if (!fetchSuccess && !isMobileDevice()) {
            try {
                const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetInsta)}`);
                if (response.ok) {
                    data = await response.json();
                    fetchSuccess = true;
                }
            } catch (e) { console.warn("Instagram proxy 1 failed, trying proxy 2..."); }
        }

        // 3. Try Proxy 2 (allorigins)
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
        alert("Failed to fetch Instagram data. Check connectivity or try again.");
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

    if (!url) { alert("Please enter an API URL."); return; }

    loader.style.display = 'block';
    responseBox.style.display = 'none';
    responseBox.innerHTML = "";

    try {
        let response;
        if (isMobileDevice()) {
            // Phone: No corsproxy
            response = await fetch(url, { method });
        } else {
            // PC: Corsproxy ON (as fallback or primary)
            try {
                response = await fetch(url, { method });
                if (!response.ok) throw new Error();
            } catch (e) {
                response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, { method });
            }
        }
        
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
