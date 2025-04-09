import * as axiosModule from 'axios';
const axios = axiosModule.default || axiosModule;

// API Configuration
const API_KEY = '8639372f4a9255120794124116c6e93f';
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NjM5MzcyZjRhOTI1NTEyMDc5NDEyNDExNmM2ZTkzZiIsIm5iZiI6MTY2NzA2ODc4NS45OTksInN1YiI6IjYzNWQ3MzcxOWJhODZhMDA4MjZkZjY1NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.eBznwz1RdRTL7z7b_0jtN-NSrg31Se6YXqSsZE3KD8Q';

// Video Sources Configuration
const VIDEO_SOURCES = [
    { 
        id: 'multiembed.regular', 
        name: 'MultiEmbed Regular', 
        baseUrl: 'https://multiembed.mov',
        isVip: false
    },
    { 
        id: 'multiembed.vip', 
        name: 'MultiEmbed VIP', 
        baseUrl: 'https://multiembed.mov/directstream.php',
        isVip: true
    },
    { 
        id: 'embed.su', 
        name: 'Embed SU', 
        baseUrl: 'https://embed.su/embed',
        isVip: false
    },
    { 
        id: 'vidsrc.to', 
        name: 'VidSrc TO', 
        baseUrl: 'https://vidsrc.to/embed',
        isVip: false
    },
    { 
        id: 'vidsrc.me', 
        name: 'VidSrc ME', 
        baseUrl: 'https://vidsrc.me/embed',
        isVip: false
    },
    { 
        id: 'vidsrc.in', 
        name: 'VidSrc IN', 
        baseUrl: 'https://vidsrc.in/embed',
        isVip: false
    },
    { 
        id: 'vidsrc.pm', 
        name: 'VidSrc PM', 
        baseUrl: 'https://vidsrc.pm/embed',
        isVip: false
    },
    { 
        id: 'vidsrc.net', 
        name: 'VidSrc NET', 
        baseUrl: 'https://vidsrc.net/embed',
        isVip: false
    },
    { 
        id: 'vidsrc.xyz', 
        name: 'VidSrc XYZ', 
        baseUrl: 'https://vidsrc.xyz/embed',
        isVip: false
    },
    { 
        id: 'vidsrc.io', 
        name: 'VidSrc IO', 
        baseUrl: 'https://vidsrc.io/embed',
        isVip: false
    },
    { 
        id: 'vidsrc.vc', 
        name: 'VidSrc VC', 
        baseUrl: 'https://vidsrc.vc/embed',
        isVip: false
    }
];

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links a');
const trendingContainer = document.getElementById('trending-content');
const popularContainer = document.getElementById('popular-content');
const topRatedContainer = document.getElementById('toprated-content');
const playerModal = document.getElementById('player-modal');
const detailModal = document.getElementById('detail-modal');
const playerIframe = document.getElementById('player-iframe');
const episodeSelector = document.getElementById('episode-selector');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const bannerTitle = document.getElementById('banner-title');
const bannerOverview = document.getElementById('banner-overview');
const bannerWatchBtn = document.getElementById('banner-watch-btn');

// State
let currentContentType = 'movie';
let currentBannerContent = null;
let currentVideoSource = VIDEO_SOURCES[0]; // Default to first source

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    // Load initial content
    await loadContent('movie');
    
    // Handle header background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            document.querySelector('header').classList.add('scrolled');
        } else {
            document.querySelector('header').classList.remove('scrolled');
        }
    });
}

function setupEventListeners() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const contentType = link.dataset.type;
            
            // Update active link
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            
            // Load content based on type
            loadContent(contentType);
        });
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            playerModal.style.display = 'none';
            detailModal.style.display = 'none';
            playerIframe.src = '';
        });
    });

    // Add play icon to all watch buttons
    document.querySelectorAll('.watch-btn').forEach(btn => {
        if (!btn.querySelector('.play-icon')) {
            const playIcon = document.createElement('span');
            playIcon.classList.add('play-icon');
            playIcon.innerHTML = '<i class="fas fa-play"></i>';
            btn.prepend(playIcon);
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === playerModal) {
            playerModal.style.display = 'none';
            playerIframe.src = '';
        }
        if (e.target === detailModal) {
            detailModal.style.display = 'none';
        }
    });

    // Search functionality
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Banner watch button
    bannerWatchBtn.addEventListener('click', () => {
        if (currentBannerContent) {
            openPlayer(currentBannerContent);
        }
    });

    // Add source selector to player modal
    const sourceSelector = document.createElement('div');
    sourceSelector.className = 'source-selector';
    sourceSelector.innerHTML = `
        <div class="source-navigation">
            <button id="prev-source" class="nav-btn" title="Previous Source">
                <i class="fas fa-chevron-left"></i>
            </button>
            <select id="video-source">
                ${VIDEO_SOURCES.map(source => 
                    `<option value="${source.id}" ${source.id === currentVideoSource.id ? 'selected' : ''}>
                        ${source.name}
                    </option>`
                ).join('')}
            </select>
            <button id="next-source" class="nav-btn" title="Next Source">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
    playerModal.querySelector('.modal-content').insertBefore(sourceSelector, playerModal.querySelector('.player-container'));

    // Handle source change
    document.getElementById('video-source').addEventListener('change', (e) => {
        const selectedSource = VIDEO_SOURCES.find(source => source.id === e.target.value);
        if (selectedSource) {
            currentVideoSource = selectedSource;
            if (currentBannerContent) {
                openPlayer(currentBannerContent);
            }
        }
    });

    // Handle previous source button
    document.getElementById('prev-source').addEventListener('click', () => {
        const currentIndex = VIDEO_SOURCES.findIndex(source => source.id === currentVideoSource.id);
        const prevIndex = (currentIndex - 1 + VIDEO_SOURCES.length) % VIDEO_SOURCES.length;
        const prevSource = VIDEO_SOURCES[prevIndex];
        
        currentVideoSource = prevSource;
        document.getElementById('video-source').value = prevSource.id;
        
        if (currentBannerContent) {
            openPlayer(currentBannerContent);
        }
    });

    // Handle next source button
    document.getElementById('next-source').addEventListener('click', () => {
        const currentIndex = VIDEO_SOURCES.findIndex(source => source.id === currentVideoSource.id);
        const nextIndex = (currentIndex + 1) % VIDEO_SOURCES.length;
        const nextSource = VIDEO_SOURCES[nextIndex];
        
        currentVideoSource = nextSource;
        document.getElementById('video-source').value = nextSource.id;
        
        if (currentBannerContent) {
            openPlayer(currentBannerContent);
        }
    });

    // Add logo click functionality
    document.querySelector('.logo').addEventListener('click', () => {
        // Refresh all content
        fetchTrendingContent();
        fetchPopularContent();
        fetchTopRatedContent();
        fetchFeaturedContent();
        
        // Add click animation
        const logo = document.querySelector('.logo');
        logo.style.transform = 'scale(0.95)';
        setTimeout(() => {
            logo.style.transform = 'scale(1)';
        }, 200);
    });
}

async function loadContent(contentType) {
    currentContentType = contentType;
    
    try {
        // Clear existing content
        trendingContainer.innerHTML = '';
        popularContainer.innerHTML = '';
        topRatedContainer.innerHTML = '';
        
        // Load trending content
        const trendingData = await fetchTMDBContent(`/trending/${contentType}/day`);
        renderContentCards(trendingData.results, trendingContainer);
        
        // Set random trending item as banner
        setRandomBanner(trendingData.results);
        
        // Load popular content
        const popularData = await fetchTMDBContent(`/${contentType}/popular`);
        renderContentCards(popularData.results, popularContainer);
        
        // Load top-rated content
        const topRatedData = await fetchTMDBContent(`/${contentType}/top_rated`);
        renderContentCards(topRatedData.results, topRatedContainer);
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function setRandomBanner(items) {
    if (!items || items.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * items.length);
    const bannerItem = items[randomIndex];
    currentBannerContent = bannerItem;
    
    const backdropPath = bannerItem.backdrop_path;
    const title = bannerItem.title || bannerItem.name;
    const overview = bannerItem.overview;
    
    if (backdropPath) {
        document.querySelector('.banner').style.backgroundImage = 
            `url(${IMG_BASE_URL}/original${backdropPath})`;
    }
    
    bannerTitle.textContent = title;
    bannerOverview.textContent = overview;
}

async function fetchTMDBContent(endpoint, params = {}) {
    try {
        // First try with axios
        try {
            const response = await axios.get(`${TMDB_API_URL}${endpoint}`, {
                params: {
                    api_key: API_KEY,
                    ...params
                },
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'accept': 'application/json'
                }
            });
            return response.data;
        } catch (axiosError) {
            // Fallback to fetch if axios fails
            console.warn('Axios failed, trying fetch:', axiosError);
            const queryParams = new URLSearchParams({
                api_key: API_KEY,
                ...params
            }).toString();
            
            const response = await fetch(`${TMDB_API_URL}${endpoint}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Fetch error: ${response.status}`);
            }
            
            return await response.json();
        }
    } catch (error) {
        console.error('TMDB API Error:', error);
        throw error;
    }
}

function renderContentCards(items, container) {
    items.forEach(item => {
        if (!item.poster_path) return;
        
        const card = document.createElement('div');
        card.classList.add('content-card');
        
        const posterUrl = `${IMG_BASE_URL}/w500${item.poster_path}`;
        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date || '';
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : '';
        
        card.innerHTML = `
            <img src="${posterUrl}" alt="${title}">
            <div class="info">
                <h4>${title}</h4>
                <p>${year} ${rating}</p>
            </div>
            <button class="watch-now-btn" title="Watch ${title}">
                <i class="fas fa-play"></i>
                Watch Now
            </button>
        `;
        
        // Add click event for the entire card
        card.addEventListener('click', (e) => {
            // Only open detail modal if not clicking the watch button
            if (!e.target.closest('.watch-now-btn')) {
                openDetailModal(item);
            }
        });
        
        // Add click event for the watch button
        const watchBtn = card.querySelector('.watch-now-btn');
        watchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openPlayer(item);
        });
        
        // Add hover effect for the card
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
        
        container.appendChild(card);
    });
}

async function openDetailModal(item) {
    const type = item.title ? 'movie' : 'tv';
    const id = item.id;
    
    try {
        // Fetch detailed information
        const details = await fetchTMDBContent(`/${type}/${id}`);
        const credits = await fetchTMDBContent(`/${type}/${id}/credits`);
        
        // Update modal content
        document.getElementById('detail-title').textContent = details.title || details.name;
        document.getElementById('detail-year').textContent = new Date(
            details.release_date || details.first_air_date || ''
        ).getFullYear();
        document.getElementById('detail-rating').textContent = 
            `⭐ ${details.vote_average.toFixed(1)}/10`;
        document.getElementById('detail-runtime').textContent = 
            type === 'movie' 
                ? `${details.runtime} min` 
                : `${details.number_of_seasons} season${details.number_of_seasons !== 1 ? 's' : ''}`;
        document.getElementById('detail-overview').textContent = details.overview;
        
        if (details.poster_path) {
            document.getElementById('detail-poster-img').src = 
                `${IMG_BASE_URL}/w500${details.poster_path}`;
        }
        
        // Render cast
        const castList = document.querySelector('.cast-list');
        castList.innerHTML = '';
        
        credits.cast.slice(0, 5).forEach(person => {
            if (!person.profile_path) return;
            
            const castItem = document.createElement('div');
            castItem.classList.add('cast-item');
            castItem.innerHTML = `
                <img src="${IMG_BASE_URL}/w185${person.profile_path}" alt="${person.name}">
                <p>${person.name}</p>
                <p class="character">${person.character}</p>
            `;
            castList.appendChild(castItem);
        });
        
        // Setup watch button
        const watchBtn = document.getElementById('detail-watch-btn');
        if (!watchBtn.querySelector('.play-icon')) {
            const playIcon = document.createElement('span');
            playIcon.classList.add('play-icon');
            playIcon.innerHTML = '<i class="fas fa-play"></i>';
            watchBtn.prepend(playIcon);
        }
        watchBtn.onclick = () => openPlayer(item);
        
        // Show modal
        detailModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading details:', error);
    }
}

async function openPlayer(item) {
    const type = item.title ? 'movie' : 'tv';
    const id = item.id;
    const isVip = currentVideoSource.isVip;
    
    try {
        if (type === 'movie') {
            // For movies, use TMDB ID
            let url;
            if (currentVideoSource.id.startsWith('multiembed')) {
                url = `${currentVideoSource.baseUrl}?video_id=${id}&tmdb=1`;
            } else {
                url = `${currentVideoSource.baseUrl}/${type}/${id}`;
            }
            playerIframe.src = url;
            episodeSelector.style.display = 'none';
        } else {
            // For TV shows, get seasons and episodes
            const details = await fetchTMDBContent(`/tv/${id}`);
            
            if (details.seasons && details.seasons.length > 0) {
                // Create season tabs
                episodeSelector.innerHTML = `
                    <div class="season-tabs"></div>
                    <div class="episodes-grid"></div>
                `;
                
                const seasonTabs = episodeSelector.querySelector('.season-tabs');
                const episodesGrid = episodeSelector.querySelector('.episodes-grid');
                
                // Filter out specials (season 0)
                const filteredSeasons = details.seasons.filter(season => season.season_number > 0);
                
                // Create tabs for each season
                filteredSeasons.forEach((season, index) => {
                    const tab = document.createElement('div');
                    tab.classList.add('season-tab');
                    if (index === 0) tab.classList.add('active');
                    tab.textContent = `Season ${season.season_number}`;
                    tab.dataset.season = season.season_number;
                    
                    tab.addEventListener('click', () => {
                        // Update active tab
                        document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        
                        // Load episodes for the selected season
                        loadEpisodes(id, season.season_number, episodesGrid);
                    });
                    
                    seasonTabs.appendChild(tab);
                });
                
                // Load episodes for the first season
                if (filteredSeasons.length > 0) {
                    loadEpisodes(id, filteredSeasons[0].season_number, episodesGrid);
                }
                
                episodeSelector.style.display = 'block';
            } else {
                // If no seasons available, try to play the first episode
                let url;
                if (currentVideoSource.id.startsWith('multiembed')) {
                    url = `${currentVideoSource.baseUrl}?video_id=${id}&tmdb=1&s=1&e=1`;
                } else {
                    url = `${currentVideoSource.baseUrl}/tv/${id}/1/1`;
                }
                playerIframe.src = url;
                episodeSelector.style.display = 'none';
            }
        }
        
        playerModal.style.display = 'block';
    } catch (error) {
        console.error('Error opening player:', error);
    }
}

async function loadEpisodes(tvId, seasonNumber, container) {
    try {
        const seasonDetails = await fetchTMDBContent(`/tv/${tvId}/season/${seasonNumber}`);
        
        container.innerHTML = '';
        
        seasonDetails.episodes.forEach(episode => {
            const episodeItem = document.createElement('div');
            episodeItem.classList.add('episode-item');
            episodeItem.innerHTML = `
                <h4>E${episode.episode_number}: ${episode.name}</h4>
                <p>${episode.runtime ? episode.runtime + ' min' : ''}</p>
            `;
            
            episodeItem.addEventListener('click', () => {
                // Update active episode
                document.querySelectorAll('.episode-item').forEach(item => item.classList.remove('active'));
                episodeItem.classList.add('active');
                
                // Load the episode in the player
                let url;
                if (currentVideoSource.id.startsWith('multiembed')) {
                    url = `${currentVideoSource.baseUrl}?video_id=${tvId}&tmdb=1&s=${seasonNumber}&e=${episode.episode_number}`;
                } else {
                    url = `${currentVideoSource.baseUrl}/tv/${tvId}/${seasonNumber}/${episode.episode_number}`;
                }
                playerIframe.src = url;
            });
            
            container.appendChild(episodeItem);
        });
        
        // Automatically select the first episode
        if (seasonDetails.episodes.length > 0) {
            const firstEpisode = container.querySelector('.episode-item');
            firstEpisode.classList.add('active');
            let url;
            if (currentVideoSource.id.startsWith('multiembed')) {
                url = `${currentVideoSource.baseUrl}?video_id=${tvId}&tmdb=1&s=${seasonNumber}&e=1`;
            } else {
                url = `${currentVideoSource.baseUrl}/tv/${tvId}/${seasonNumber}/1`;
            }
            playerIframe.src = url;
        }
    } catch (error) {
        console.error('Error loading episodes:', error);
    }
}

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    try {
        const results = await fetchTMDBContent('/search/multi', { query });
        
        // Clear content and show results
        trendingContainer.innerHTML = '';
        popularContainer.innerHTML = '';
        topRatedContainer.innerHTML = '';
        
        // Filter results to only movies and TV shows
        const validResults = results.results.filter(
            item => item.media_type === 'movie' || item.media_type === 'tv'
        );
        
        // Update headers
        document.querySelector('#trending-content').previousElementSibling.textContent = 'Search Results';
        document.querySelector('#popular-content').previousElementSibling.textContent = '';
        document.querySelector('#toprated-content').previousElementSibling.textContent = '';
        
        renderContentCards(validResults, trendingContainer);
        
        // Set the first result as banner if available
        if (validResults.length > 0) {
            setRandomBanner([validResults[0]]);
        }
    } catch (error) {
        console.error('Error searching:', error);
    }
}