// Embed page JavaScript

class EmbedPlayer {
    constructor() {
        this.video = document.getElementById('embedVideo');
        this.loadingOverlay = document.getElementById('embedLoadingOverlay');
        this.errorOverlay = document.getElementById('embedErrorOverlay');
        this.errorMessage = document.getElementById('embedErrorMessage');
        
        this.initializeEmbed();
        this.bindEvents();
        this.loadStream();
    }

    initializeEmbed() {
        // Set initial volume to 0 (muted) for autoplay compatibility
        this.video.volume = 0;
    }

    bindEvents() {
        // Video events
        this.video.addEventListener('loadstart', () => this.handleLoadStart());
        this.video.addEventListener('loadedmetadata', () => this.handleLoadedMetadata());
        this.video.addEventListener('canplay', () => this.handleCanPlay());
        this.video.addEventListener('playing', () => this.handlePlaying());
        this.video.addEventListener('error', (e) => this.handleError(e));
        
        // Handle iframe communication
        window.addEventListener('message', (event) => this.handleMessage(event));
    }

    loadStream() {
        const b64Param = getUrlParam('b64');
        if (!b64Param) {
            this.showError('No stream URL provided');
            return;
        }

        const decodedUrl = decodeUrl(b64Param);
        if (!decodedUrl || !isValidUrl(decodedUrl)) {
            this.showError('Invalid stream URL');
            return;
        }

        this.showLoading();
        
        // Set video source
        this.video.src = decodedUrl;
        this.video.load();
    }

    handleLoadStart() {
        this.showLoading();
    }

    handleLoadedMetadata() {
        this.hideLoading();
        
        // Try to play (will be muted for autoplay compatibility)
        this.video.play().catch(error => {
            console.log('Autoplay prevented:', error);
        });
    }

    handleCanPlay() {
        this.hideLoading();
    }

    handlePlaying() {
        this.hideLoading();
    }

    handleError(event) {
        console.error('Video error:', event);
        const error = this.video.error;
        let errorMessage = 'Unable to load the stream';
        
        if (error) {
            switch (error.code) {
                case MediaError.MEDIA_ERR_ABORTED:
                    errorMessage = 'Stream loading was aborted';
                    break;
                case MediaError.MEDIA_ERR_NETWORK:
                    errorMessage = 'Network error while loading stream';
                    break;
                case MediaError.MEDIA_ERR_DECODE:
                    errorMessage = 'Stream decoding error';
                    break;
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMessage = 'Stream format not supported';
                    break;
            }
        }
        
        this.showError(errorMessage);
    }

    handleMessage(event) {
        // Handle messages from parent window
        const { type, data } = event.data;
        
        switch (type) {
            case 'play':
                this.video.play();
                break;
            case 'pause':
                this.video.pause();
                break;
            case 'mute':
                this.video.muted = true;
                break;
            case 'unmute':
                this.video.muted = false;
                break;
            case 'setVolume':
                if (data && typeof data.volume === 'number') {
                    this.video.volume = Math.max(0, Math.min(1, data.volume));
                }
                break;
            case 'seek':
                if (data && typeof data.time === 'number') {
                    this.video.currentTime = data.time;
                }
                break;
        }
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
        this.errorOverlay.style.display = 'none';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorOverlay.style.display = 'flex';
        this.loadingOverlay.style.display = 'none';
    }

    hideError() {
        this.errorOverlay.style.display = 'none';
    }
}

// Initialize embed player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmbedPlayer();
});

