// Main application JavaScript

class MediaPlayerApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.checkForSharedUrl();
    }

    initializeElements() {
        this.streamUrlInput = document.getElementById('streamUrl');
        this.clearBtn = document.getElementById('clearBtn');
        this.openPlayerBtn = document.getElementById('openPlayerBtn');
        this.openEmbedBtn = document.getElementById('openEmbedBtn');
        this.shareSection = document.getElementById('shareSection');
        this.shareLink = document.getElementById('shareLink');
        this.copyLinkBtn = document.getElementById('copyLinkBtn');
    }

    bindEvents() {
        // URL input handling
        this.streamUrlInput.addEventListener('input', debounce(this.handleUrlInput.bind(this), 300));
        this.streamUrlInput.addEventListener('paste', this.handleUrlPaste.bind(this));
        this.streamUrlInput.addEventListener('keypress', this.handleUrlKeypress.bind(this));

        // Clear button
        this.clearBtn.addEventListener('click', this.clearUrl.bind(this));

        // Action buttons
        this.openPlayerBtn.addEventListener('click', () => this.openPlayer());
        this.openEmbedBtn.addEventListener('click', () => this.openEmbed());

        // Copy link button
        this.copyLinkBtn.addEventListener('click', this.copyShareLink.bind(this));

        // Focus management
        this.streamUrlInput.addEventListener('focus', this.handleInputFocus.bind(this));
        this.streamUrlInput.addEventListener('blur', this.handleInputBlur.bind(this));
    }

    checkForSharedUrl() {
        const b64Param = getUrlParam('b64');
        if (b64Param) {
            const decodedUrl = decodeUrl(b64Param);
            if (decodedUrl && isValidUrl(decodedUrl)) {
                this.streamUrlInput.value = decodedUrl;
                this.updateButtonStates(true);
                this.updateShareLink();
            }
        }
    }

    handleUrlInput(event) {
        const url = event.target.value.trim();
        const isValid = url && isValidUrl(url);
        
        this.updateButtonStates(isValid);
        this.updateShareLink();
        
        // Update clear button visibility
        this.clearBtn.style.display = url ? 'block' : 'none';
    }

    handleUrlPaste(event) {
        // Allow the paste to complete, then validate
        setTimeout(() => {
            this.handleUrlInput({ target: { value: this.streamUrlInput.value } });
        }, 10);
    }

    handleUrlKeypress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const url = this.streamUrlInput.value.trim();
            if (url && isValidUrl(url)) {
                this.openPlayer();
            }
        }
    }

    handleInputFocus() {
        this.streamUrlInput.parentElement.classList.add('focused');
    }

    handleInputBlur() {
        this.streamUrlInput.parentElement.classList.remove('focused');
    }

    clearUrl() {
        this.streamUrlInput.value = '';
        this.updateButtonStates(false);
        this.hideShareSection();
        this.clearBtn.style.display = 'none';
        this.streamUrlInput.focus();
    }

    updateButtonStates(enabled) {
        this.openPlayerBtn.disabled = !enabled;
        this.openEmbedBtn.disabled = !enabled;
        
        // Update button styles
        if (enabled) {
            this.openPlayerBtn.classList.add('btn-enabled');
            this.openEmbedBtn.classList.add('btn-enabled');
        } else {
            this.openPlayerBtn.classList.remove('btn-enabled');
            this.openEmbedBtn.classList.remove('btn-enabled');
        }
    }

    updateShareLink() {
        const url = this.streamUrlInput.value.trim();
        if (url && isValidUrl(url)) {
            const encodedUrl = encodeUrl(url);
            const shareUrl = `${window.location.origin}${window.location.pathname}?b64=${encodedUrl}`;
            this.shareLink.value = shareUrl;
            this.showShareSection();
        } else {
            this.hideShareSection();
        }
    }

    showShareSection() {
        this.shareSection.style.display = 'block';
        this.shareSection.classList.add('show');
    }

    hideShareSection() {
        this.shareSection.classList.remove('show');
        setTimeout(() => {
            this.shareSection.style.display = 'none';
        }, 300);
    }

    async copyShareLink() {
        const success = await copyToClipboard(this.shareLink.value);
        if (success) {
            showNotification('Share link copied to clipboard!', 'success');
        } else {
            showNotification('Failed to copy link', 'error');
        }
    }

    openPlayer() {
        const url = this.streamUrlInput.value.trim();
        if (url && isValidUrl(url)) {
            const encodedUrl = encodeUrl(url);
            window.open(`player.html?b64=${encodedUrl}`, '_blank');
        }
    }

    openEmbed() {
        const url = this.streamUrlInput.value.trim();
        if (url && isValidUrl(url)) {
            const encodedUrl = encodeUrl(url);
            window.open(`embed.html?b64=${encodedUrl}`, '_blank');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MediaPlayerApp();
});

// Add some example URLs for testing
const exampleUrls = [
    'https://cdn.jwplayer.com/manifests/PESQNF4x.m3u8',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
];

// Add example URL button for testing (optional)
function addExampleUrlButton() {
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup) {
        const exampleBtn = document.createElement('button');
        exampleBtn.className = 'btn btn-example';
        exampleBtn.textContent = 'Load Example';
        exampleBtn.onclick = () => {
            const randomUrl = exampleUrls[Math.floor(Math.random() * exampleUrls.length)];
            document.getElementById('streamUrl').value = randomUrl;
            document.getElementById('streamUrl').dispatchEvent(new Event('input'));
        };
        buttonGroup.appendChild(exampleBtn);
    }
}

// Uncomment the line below to add an example URL button for testing
// addExampleUrlButton();

