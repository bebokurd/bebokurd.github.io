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
    renderCategoriesHub();
    updateClock();
    updateStats();
    handleDeepLink();
    
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
    document.title = metadata.seo;

    // Auto-load latest content for KD and KM if they are empty
    if (tabId === 'kurddoblazh') {
        const resultsBox = document.getElementById('kd-results');
        if (resultsBox && resultsBox.innerHTML === "") {
            fetchKurdDoblazhLatest();
            fetchKurdDoblazhLabels();
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
                } catch(e) {
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
        } catch(e){}
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
    } catch(e) {
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
            } catch (e) {}
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
                    } catch (err) {}
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
                } catch (err) {}
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
                } catch (e) {}
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
                    } catch (err) {}
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
            } catch (err) {}
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
                    } catch (e) {}
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
    } catch(e) {
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
        } catch(e){}
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
        } else {
            if (!matchesCat) item.classList.add('hidden-cat');
            if (!matchesSearch) item.classList.add('hidden-search');
            item.style.display = 'none';
        }
    });
}

/* ==========================================================================
   AI SEARCH ASSISTANT HUB ENGINE
   ========================================================================== */

let currentSearchMode = 'copilot';
let activeAiQuery = '';
let activeAiResponseCitations = [];

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

/**
 * Dynamic parser helper that converts basic Markdown syntax to premium HTML.
 * Handles headings, bold tags, code segments, lists, and links.
 * @param {string} text - Raw markdown
 * @returns {string} Parsed HTML
 */
function parseMarkdownToHtml(text) {
    let html = text;
    
    // Escape standard HTML tags to prevent injections
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // Parse bold text: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Parse italic text: *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Parse block headers: ### text
    html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');
    
    // Parse pre code blocks
    html = html.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
    
    // Parse inline code segments
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Parse lists
    html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    // Group adjacent <li> elements into lists
    html = html.replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); // deduplicate ul groups
    
    // Parse standard markdown links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Parse custom bracket citations: [N] -> <span class="citation-number" onclick="scrollToCitation(N)">N</span>
    html = html.replace(/\[(\d+)\]/g, (match, num) => {
        return `<span class="citation-number" onclick="triggerCitationAction(${parseInt(num) - 1})">${num}</span>`;
    });
    
    // Replace newline blocks with paragraphs
    html = html.split('\n\n').map(p => {
        if (p.trim().startsWith('<ul') || p.trim().startsWith('<h4') || p.trim().startsWith('<pre')) {
            return p;
        }
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
    
    return html;
}

/**
 * Stream typing animation simulation
 * @param {string} rawMarkdown - Text to render
 * @param {Array} citations - Citation list
 */
function streamAiResponse(rawMarkdown, citations) {
    const responseFeed = document.getElementById('ai-response-feed');
    const thinkingIndicator = document.getElementById('ai-thinking-indicator');
    const responseCard = document.getElementById('ai-response-card');
    const textContainer = document.getElementById('ai-response-text');
    const citationsContainer = document.getElementById('ai-citations-container');
    const citationsGrid = document.getElementById('ai-citations-grid');

    if (!textContainer || !responseCard) return;

    // 1. Hide welcome state, show results feed
    document.getElementById('ai-chat-welcome-screen').style.display = 'none';
    responseFeed.style.display = 'block';
    
    // 2. Clear old states
    textContainer.innerHTML = '';
    responseCard.style.display = 'none';
    citationsContainer.style.display = 'none';
    citationsGrid.innerHTML = '';
    
    // 3. Show dynamic loader
    thinkingIndicator.style.display = 'flex';
    
    // Simulate natural thinking delay (RAG retrieval & semantic mapping simulation)
    setTimeout(() => {
        thinkingIndicator.style.display = 'none';
        responseCard.style.display = 'block';
        
        // 4. Begin typewriter character streaming
        let index = 0;
        const totalLength = rawMarkdown.length;
        const increment = 3; // Type 3 characters at a time for high speed but fluid feel
        
        function typeChar() {
            if (index < totalLength) {
                index += increment;
                const visibleSub = rawMarkdown.substring(0, Math.min(index, totalLength));
                textContainer.innerHTML = parseMarkdownToHtml(visibleSub) + '<span class="typewriter-cursor">|</span>';
                
                // Keep view scroll snapped to bottom
                const mainScroll = document.getElementById('main-scroll');
                if (mainScroll) mainScroll.scrollTop = mainScroll.scrollHeight;
                
                setTimeout(typeChar, 15);
            } else {
                // Done typing - clean up cursor
                textContainer.innerHTML = parseMarkdownToHtml(rawMarkdown);
                
                // 5. Render citation cards if matches exist
                if (citations && citations.length > 0) {
                    citationsGrid.innerHTML = '';
                    citations.forEach((pkg, idx) => {
                        const num = idx + 1;
                        const icon = pkg.icon || 'fas fa-box';
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
                
                const mainScroll = document.getElementById('main-scroll');
                if (mainScroll) mainScroll.scrollTop = mainScroll.scrollHeight;
            }
        }
        
        typeChar();
    }, 1500);
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
    
    document.getElementById('ai-chat-welcome-screen').style.display = 'flex';
    document.getElementById('ai-response-feed').style.display = 'none';
    
    activeAiQuery = '';
    activeAiResponseCitations = [];
}

/**
 * Copies the raw typed response block to browser clipboard
 */
function copyAiResponse() {
    const responseText = document.getElementById('ai-response-text');
    if (responseText) {
        navigator.clipboard.writeText(responseText.innerText);
        showToast('AI response copied to clipboard!', 'fa-check-circle');
    }
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
    
    // 1. Run TF-IDF local index scorer
    const matchedPackages = scoreQueryAgainstPackages(query);
    
    // 2. Synthesize portfolio RAG baseline content
    const localMarkdown = synthesizeLocalAiResponse(query, matchedPackages);
    
    // 3. Connect to Hugging Face serverless client (for general web/tech topics)
    // To maintain CORS compatibility and keyless operation, we query public serverless models.
    const isLocalSpecific = query.toLowerCase().includes('chya') || 
                            query.toLowerCase().includes('cydia') || 
                            query.toLowerCase().includes('download') || 
                            query.toLowerCase().includes('tiktok') || 
                            query.toLowerCase().includes('kurdstream');
                            
    if (isLocalSpecific) {
        // High fidelity portfolio questions use the native fast client-side RAG engine immediately.
        streamAiResponse(localMarkdown, activeAiResponseCitations);
        return;
    }
    
    // Otherwise, attempt Hugging Face serverless live indexing with local-RAG fallback
    try {
        // Show loading state immediately while API resolves
        document.getElementById('ai-chat-welcome-screen').style.display = 'none';
        document.getElementById('ai-response-feed').style.display = 'block';
        document.getElementById('ai-thinking-indicator').style.display = 'flex';
        document.getElementById('ai-response-card').style.display = 'none';
        
        const payload = {
            inputs: `[System Prompt]: You are Cydia Elite Copilot, an elite AI technical assistant integrated directly inside Chya Luqman's premium portfolio and package tweaks repository. Be highly professional, brief, format answers using Markdown, and naturally introduce relevant items from this portfolio.
            
            [Chya Luqman Bio]: UI/UX Engineer and developer who built Cydia Elite. Discord community has 2.5k members: https://discord.gg/YTeRSG8kER. Instagram is @chya_luqman.
            
            [User Question]: ${query}
            
            [Scored Portfolio Matches]: ${matchedPackages.map(p => p.name + " (" + p.desc + ")").join(", ")}
            
            Please provide a direct, conversational answer answering the user's question, format with markdown bold, bullet points or pre/code blocks if writing code.`,
            parameters: { max_new_tokens: 450, temperature: 0.7 }
        };
        
        // Zero-key public serverless endpoint (free model instance)
        const response = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-7B-Instruct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error("Serverless API offline or rate-limited");
        
        const data = await response.json();
        let answer = "";
        
        if (Array.isArray(data) && data[0] && data[0].generated_text) {
            answer = data[0].generated_text;
        } else if (data && data.generated_text) {
            answer = data.generated_text;
        } else {
            throw new Error("Invalid model response structure");
        }
        
        // Clean system prompt remnants from response if generated
        if (answer.includes("[User Question]:")) {
            answer = answer.substring(answer.lastIndexOf("[User Question]:") + 16 + query.length).trim();
        }
        if (answer.includes("Please provide a direct, conversational answer")) {
            answer = answer.substring(answer.lastIndexOf("Please provide a direct, conversational answer") + 46).trim();
        }
        
        // Link matched local search index packages as citations at the bottom
        activeAiResponseCitations = [...matchedPackages];
        
        // Hide loader and stream typed response
        document.getElementById('ai-thinking-indicator').style.display = 'none';
        streamAiResponse(answer.trim(), activeAiResponseCitations);
        
    } catch (err) {
        console.warn("Hugging Face API unavailable. Falling back to local portfolio-intelligence RAG graph...", err);
        // Seamlessly execute local RAG baseline generator. User gets a perfect, beautiful experience with 0 errors!
        streamAiResponse(localMarkdown, activeAiResponseCitations);
    }
}



