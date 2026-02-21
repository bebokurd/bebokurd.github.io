// ==UserScript==
// @name         01 Dev Redirector | UI Overhaul
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Wipes page content, provides a premium cyberpunk UI, and redirects securely.
// @author       01 dev
// @license      MIT
// @supportURL   https://discord.gg/arVdGh76wj
// @updateURL    https://gist.github.com/bebokurd/3a80977c06b09e5fd15ae331fcbd87ee/raw/script.user.js
// @downloadURL  https://gist.github.com/bebokurd/3a80977c06b09e5fd15ae331fcbd87ee/raw/script.user.js
// @match        *://*.linkvertise.com/*
// @match        *://*.link-to.net/*
// @match        *://*.direct-link.net/*
// @match        *://*.file-link.net/*
// @match        *://*.sub2get.com/*
// @match        *://*.loot-link.com/*
// @match        *://*.loot-links.com/*
// @match        *://*.lootdest.com/*
// @match        *://*.adfoc.us/*
// @match        *://*.boost.ink/*
// @match        *://*.leasurepartment.xyz/*
// @match        *://*.letsboost.net/*
// @match        *://*.mboost.me/*
// @match        *://*.rekonise.com/*
// @match        *://*.shorte.st/*
// @match        *://*.sub2unlock.com/*
// @match        *://*.sub2unlock.net/*
// @match        *://*.v.gd/*
// @match        *://*.tinyurl.com/*
// @match        *://*.bit.ly/*
// @match        *://*.is.gd/*
// @match        *://*.rebrand.ly/*
// @match        *://*.empebau.eu/*
// @match        *://*.socialwolvez.com/*
// @match        *://*.sub1s.com/*
// @match        *://*.tinylink.onl/*
// @match        *://*.justpaste.it/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linkvertise.com
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        API_ENDPOINT: 'https://bypass.city/bypass?bypass=',
        DISCORD: 'https://discord.gg/arVdGh76wj',
        DELAY: 5,
        THEME: {
            PRIMARY: '#6366f1', // Indigo
            ACCENT: '#06b6d4',  // Cyan
            BG: '#030305',      // Void Black
            CARD: '#0f0f11'     // Card BG
        },
        DOMAINS: [
            'linkvertise.com', 'link-to.net', 'direct-link.net', 'file-link.net',
            'sub2get.com', 'loot-link.com', 'loot-links.com', 'lootdest.com',
            'adfoc.us', 'boost.ink', 'leasurepartment.xyz', 'letsboost.net',
            'mboost.me', 'rekonise.com', 'shorte.st', 'sub2unlock.com',
            'sub2unlock.net', 'v.gd', 'tinyurl.com', 'bit.ly', 'is.gd',
            'rebrand.ly', 'empebau.eu', 'socialwolvez.com', 'sub1s.com',
            'tinylink.onl', 'justpaste.it'
        ]
    };

    class BypassEngine {
        constructor() {
            this.url = window.location.href;
            this.targetUrl = CONFIG.API_ENDPOINT + encodeURIComponent(this.url);
            this.stats = {
                count: GM_getValue('bypass_count', 0)
            };
        }

        shouldRun() {
            return CONFIG.DOMAINS.some(d => this.url.includes(d)) && window.self === window.top;
        }

        execute() {
            if (!this.shouldRun()) return;

            // Stats
            GM_setValue('bypass_count', this.stats.count + 1);

            // Nuke the DOM immediately
            try {
                window.stop();
                document.documentElement.innerHTML = '';
            } catch(e) {}

            // Render UI
            new UIManager(this.targetUrl, this.stats.count + 1).render();
        }
    }

    class UIManager {
        constructor(url, count) {
            this.url = url;
            this.count = count;
            this.timeLeft = CONFIG.DELAY;
        }

        render() {
            // CSS Construction
            const style = document.createElement('style');
            style.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;600;800&display=swap');

                :root { --p: ${CONFIG.THEME.PRIMARY}; --a: ${CONFIG.THEME.ACCENT}; --bg: ${CONFIG.THEME.BG}; --card: ${CONFIG.THEME.CARD}; }

                body, html {
                    margin: 0; padding: 0; width: 100%; height: 100%;
                    background-color: var(--bg); overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }

                /* Grid Background Pattern */
                .bg-grid {
                    position: absolute; inset: 0; opacity: 0.15;
                    background-image:
                        linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px);
                    background-size: 40px 40px;
                    animation: gridMove 20s linear infinite;
                }

                #app-root {
                    position: relative; width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    z-index: 10;
                }

                .card {
                    position: relative; width: 400px; padding: 48px 32px;
                    background: rgba(15, 15, 17, 0.7);
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    box-shadow: 0 0 60px rgba(99, 102, 241, 0.15);
                    display: flex; flex-direction: column; align-items: center;
                    animation: cardEnter 0.6s cubic-bezier(0.2, 0.9, 0.3, 1);
                }

                /* --- NEW ICON DESIGN --- */
                .icon-wrapper {
                    position: relative; width: 90px; height: 90px;
                    margin-bottom: 24px;
                    filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.4));
                }

                .svg-icon { width: 100%; height: 100%; }

                /* SVG Animations */
                .shield-path {
                    fill: rgba(15, 15, 17, 0.8); stroke: url(#grad1); stroke-width: 2.5;
                    stroke-dasharray: 300; stroke-dashoffset: 300;
                    animation: drawShield 1.5s ease-out forwards;
                }
                .bolt-path {
                    fill: url(#grad1); opacity: 0;
                    transform-origin: center;
                    animation: boltStrike 0.4s 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .scan-line {
                    fill: url(#grad1); opacity: 0.5;
                    animation: scanDown 3s infinite linear;
                }

                .title {
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 800; font-size: 28px; letter-spacing: -1px;
                    background: linear-gradient(135deg, #fff 40%, var(--p) 100%);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    margin-bottom: 8px;
                }

                .subtitle {
                    font-size: 13px; color: #888; font-weight: 500;
                    margin-bottom: 32px; letter-spacing: 0.5px;
                }

                /* Timer Ring */
                .timer-box { position: relative; width: 80px; height: 80px; margin-bottom: 32px; }
                .timer-svg { transform: rotate(-90deg); width: 80px; height: 80px; }
                .timer-circle-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 4; }
                .timer-circle-fg {
                    fill: none; stroke: var(--a); stroke-width: 4; stroke-linecap: round;
                    stroke-dasharray: 238; stroke-dashoffset: 0;
                    transition: stroke-dashoffset 1s linear;
                    filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.5));
                }
                .timer-text {
                    position: absolute; inset: 0;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 24px; font-weight: 700; color: #fff;
                }

                .btn {
                    width: 100%; padding: 16px; border-radius: 12px;
                    background: linear-gradient(90deg, var(--p), #4f46e5);
                    color: #fff; text-decoration: none; font-weight: 600;
                    text-align: center; border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.2s;
                    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
                }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5); }

                .footer {
                    margin-top: 24px; font-size: 11px; color: #555;
                    font-family: 'JetBrains Mono', monospace; display: flex; gap: 15px;
                }
                .footer a { color: #777; text-decoration: none; transition: 0.2s; }
                .footer a:hover { color: var(--a); }

                /* Animations */
                @keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
                @keyframes cardEnter { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes drawShield { to { stroke-dashoffset: 0; } }
                @keyframes boltStrike { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
                @keyframes scanDown { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(80px); opacity: 0; } }
            `;

            document.head.appendChild(style);

            // Icon SVG Definition
            const iconSVG = `
            <svg class="svg-icon" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${CONFIG.THEME.ACCENT};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${CONFIG.THEME.PRIMARY};stop-opacity:1" />
                    </linearGradient>
                    <clipPath id="shieldClip">
                         <path d="M50 10 L85 25 V55 Q85 85 50 95 Q15 85 15 55 V25 Z" />
                    </clipPath>
                </defs>

                <!-- Shield Outline -->
                <path class="shield-path" d="M50 10 L85 25 V55 Q85 85 50 95 Q15 85 15 55 V25 Z" fill="none" />

                <!-- Inner Bolt -->
                <path class="bolt-path" d="M56 30 L38 58 H52 L46 80 L64 50 H50 L56 30 Z" />

                <!-- Scanning Line Effect -->
                <g clip-path="url(#shieldClip)">
                    <rect class="scan-line" x="0" y="0" width="100" height="2" />
                </g>
            </svg>
            `;

            // HTML Structure
            const root = document.createElement('div');
            root.id = 'app-root';

            root.innerHTML = `
                <div class="bg-grid"></div>
                <div class="card">
                    <div class="icon-wrapper">${iconSVG}</div>

                    <div class="title">01 DEV</div>
                    <div class="subtitle">AUTOMATED LINK BYPASS SYSTEM</div>

                    <div class="timer-box">
                        <svg class="timer-svg" viewBox="0 0 88 88">
                            <circle class="timer-circle-bg" cx="44" cy="44" r="38"></circle>
                            <circle class="timer-circle-fg" id="progress-ring" cx="44" cy="44" r="38"></circle>
                        </svg>
                        <div class="timer-text" id="timer-val">${CONFIG.DELAY}</div>
                    </div>

                    <a href="${this.url}" class="btn" id="bypass-btn">BYPASS NOW</a>

                    <div class="footer">
                        <span>TOTAL: ${this.count}</span>
                        <span>•</span>
                        <a href="${CONFIG.DISCORD}" target="_blank">DISCORD</a>
                    </div>
                </div>
            `;

            document.body.appendChild(root);
            this.startTimer();
        }

        startTimer() {
            const ring = document.getElementById('progress-ring');
            const val = document.getElementById('timer-val');
            const btn = document.getElementById('bypass-btn');
            const circumference = 238;
            let elapsed = 0;

            // Initial click listener
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                btn.innerHTML = "REDIRECTING...";
                window.location.replace(this.url);
            });

            const interval = setInterval(() => {
                elapsed++;
                const remaining = CONFIG.DELAY - elapsed;

                // Update Text
                val.innerText = remaining;

                // Update Ring
                const offset = circumference - (remaining / CONFIG.DELAY) * circumference;
                ring.style.strokeDashoffset = offset;

                if (remaining <= 0) {
                    clearInterval(interval);
                    val.innerText = "✓";
                    ring.style.stroke = "#10b981"; // Green on finish
                    btn.innerHTML = "REDIRECTING...";
                    window.location.replace(this.url);
                }
            }, 1000);
        }
    }

    if (document.readyState === 'loading') {
        new BypassEngine().execute();
    } else {
        new BypassEngine().execute();
    }

})();