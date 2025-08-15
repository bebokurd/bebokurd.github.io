// Player page JavaScript

class MediaPlayer {
    constructor() {
        this.video = document.getElementById('videoPlayer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorOverlay = document.getElementById('errorOverlay');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        this.backBtn = document.getElementById('backBtn');
        
        // Control elements
        this.volumeSlider = document.getElementById('volumeSlider');
        this.muteBtn = document.getElementById('muteBtn');
        this.muteIcon = document.getElementById('muteIcon');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        // Info elements
        this.streamStatus = document.getElementById('streamStatus');
        this.streamDuration = document.getElementById('streamDuration');
        this.currentTime = document.getElementById('currentTime');
        
        this.isMuted = true;
        this.currentUrl = '';
        
        this.initializePlayer();
        this.bindEvents();
        this.loadStream();
    }

    initializePlayer() {
        // Set initial volume to 0 (muted) for autoplay compatibility
        this.video.volume = 0;
        this.volumeSlider.value = 0;
        
        // Update status
        this.streamStatus.textContent = 'Initializing...';
    }

    bindEvents() {
        // Video events
        this.video.addEventListener('loadstart', () => this.handleLoadStart());
        this.video.addEventListener('loadedmetadata', () => this.handleLoadedMetadata());
        this.video.addEventListener('canplay', () => this.handleCanPlay());
        this.video.addEventListener('playing', () => this.handlePlaying());
        this.video.addEventListener('pause', () => this.handlePause());
        this.video.addEventListener('ended', () => this.handleEnded());
        this.video.addEventListener('error', (e) => this.handleError(e));
        this.video.addEventListener('timeupdate', throttle(() => this.updateTimeDisplay(), 100));
        this.video.addEventListener('volumechange', () => this.handleVolumeChange());
        
        // Control events
        this.volumeSlider.addEventListener('input', (e) => this.handleVolumeChange(e));
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.retryBtn.addEventListener('click', () => this.retryStream());
        this.backBtn.addEventListener('click', () => this.goBack());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
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

        this.currentUrl = decodedUrl;
        this.streamStatus.textContent = 'Loading stream...';
        this.showLoading();
        
        // Set video source
        this.video.src = decodedUrl;
        this.video.load();
    }

    handleLoadStart() {
        this.streamStatus.textContent = 'Loading stream...';
        this.showLoading();
    }

    handleLoadedMetadata() {
        this.streamStatus.textContent = 'Stream loaded';
        this.hideLoading();
        
        // Update duration if available
        if (this.video.duration && !isNaN(this.video.duration)) {
            this.streamDuration.textContent = formatTime(this.video.duration);
        }
    }

    handleCanPlay() {
        this.streamStatus.textContent = 'Ready to play';
        this.hideLoading();
        
        // Try to play (will be muted for autoplay compatibility)
        this.video.play().catch(error => {
            console.log('Autoplay prevented:', error);
            this.streamStatus.textContent = 'Click to play';
        });
    }

    handlePlaying() {
        this.streamStatus.textContent = 'Playing';
        this.hideLoading();
    }

    handlePause() {
        this.streamStatus.textContent = 'Paused';
    }

    handleEnded() {
        this.streamStatus.textContent = 'Stream ended';
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

    handleVolumeChange(event) {
        if (event && event.target) {
            const volume = event.target.value / 100;
            this.video.volume = volume;
        }
        
        // Update mute state based on volume
        this.isMuted = this.video.volume === 0;
        this.updateMuteIcon();
    }

    toggleMute() {
        if (this.isMuted) {
            // Unmute - set volume to 50%
            this.video.volume = 0.5;
            this.volumeSlider.value = 50;
        } else {
            // Mute
            this.video.volume = 0;
            this.volumeSlider.value = 0;
        }
        
        this.isMuted = this.video.volume === 0;
        this.updateMuteIcon();
    }

    updateMuteIcon() {
        this.muteIcon.textContent = this.isMuted ? '🔇' : '🔊';
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.video.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    updateTimeDisplay() {
        if (!isNaN(this.video.currentTime)) {
            this.currentTime.textContent = formatTime(this.video.currentTime);
        }
    }

    retryStream() {
        this.hideError();
        this.loadStream();
    }

    goBack() {
        window.history.back();
    }

    handleKeyboard(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                if (this.video.paused) {
                    this.video.play();
                } else {
                    this.video.pause();
                }
                break;
            case 'KeyM':
                event.preventDefault();
                this.toggleMute();
                break;
            case 'KeyF':
                event.preventDefault();
                this.toggleFullscreen();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.video.currentTime = Math.max(0, this.video.currentTime - 10);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
                break;
            case 'Escape':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
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
        this.streamStatus.textContent = 'Error';
    }

    hideError() {
        this.errorOverlay.style.display = 'none';
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MediaPlayer();
});

