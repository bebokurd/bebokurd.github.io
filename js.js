let currentPage = 1;
let totalPages = 1;
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results-container');
const errorContainer = document.getElementById('error-container');
const modal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
let currentType = 'movies';
const TMDB_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NjM5MzcyZjRhOTI1NTEyMDc5NDEyNDExNmM2ZTkzZiIsIm5iZiI6MTY2NzA2ODc4NS45OTksInN1YiI6IjYzNWQ3MzcxOWJhODZhMDA4MjZkZjY1NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.eBznwz1RdRTL7z7b_0jtN-NSrg31Se6YXqSsZE3KD8Q'
  }
};
const CARTOON_GENRES = [16]; // Animation genre ID for TMDB API
async function loadLatestTVShows(page = 1) {
  try {
    if (currentType === 'cartoon') {
      const response = await fetch(`https://api.themoviedb.org/3/discover/tv?with_genres=${CARTOON_GENRES.join(',')}&page=${page}`, TMDB_OPTIONS);
      const data = await response.json();
      totalPages = data.total_pages;
      const shows = data.results.map(show => ({
        title: show.name,
        year: new Date(show.first_air_date).getFullYear(),
        medium_cover_image: show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : '',
        large_cover_image: show.poster_path ? `https://image.tmdb.org/t/p/original${show.poster_path}` : '',
        rating: show.vote_average,
        genres: show.genre_ids,
        description_full: show.overview,
        language: show.original_language,
        id: show.id
      }));
      displayResults(shows);
      renderPagination();
    } else {
      const response = await fetch(`https://api.themoviedb.org/3/tv/popular?language=en-US&page=${page}`, TMDB_OPTIONS);
      const data = await response.json();
      totalPages = data.total_pages;
      const shows = data.results.map(show => ({
        title: show.name,
        year: new Date(show.first_air_date).getFullYear(),
        medium_cover_image: show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : '',
        large_cover_image: show.poster_path ? `https://image.tmdb.org/t/p/original${show.poster_path}` : '',
        rating: show.vote_average,
        genres: show.genre_ids,
        description_full: show.overview,
        language: show.original_language,
        id: show.id
      }));
      displayResults(shows);
      renderPagination();
    }
  } catch (error) {
    showError(`Failed to load latest ${currentType}`);
  }
}
async function changePage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  if (currentType === 'tv') {
    await loadLatestTVShows(page);
  } else {
    await loadPopular();
  }
}
function switchType(type) {
  currentType = type;
  currentPage = 1;
  totalPages = 1;
  document.title = `Chya TV - ${type === 'movies' ? 'Movies' : type === 'tv' ? 'TV Shows' : 'Cartoons'}`;
  document.querySelectorAll('.type-button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.type === type) {
      btn.classList.add('active');
      const ripple = document.createElement('div');
      ripple.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      ripple.style.left = '50%';
      ripple.style.top = '50%';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  });
  searchInput.placeholder = `Search for ${type === 'movies' ? 'movies' : type === 'tv' ? 'TV shows' : 'cartoons'}...`;
  loadPopular();
}
document.querySelectorAll('.type-button').forEach(button => {
  button.addEventListener('click', () => {
    switchType(button.dataset.type);
  });
});
document.addEventListener('click', e => {
  if (e.target.classList.contains('type-button')) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    e.target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
});
async function searchMovies(query) {
  try {
    let endpoint;
    if (currentType === 'cartoon') {
      endpoint = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&with_genres=${CARTOON_GENRES.join(',')}&language=en-US&page=${currentPage}`;
      const response = await fetch(endpoint, TMDB_OPTIONS);
      const data = await response.json();
      totalPages = data.total_pages;
      if (data.results.length > 0) {
        displayResults(data.results.map(show => ({
          title: show.name,
          year: new Date(show.first_air_date).getFullYear(),
          medium_cover_image: show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : '',
          large_cover_image: show.poster_path ? `https://image.tmdb.org/t/p/original${show.poster_path}` : '',
          rating: show.vote_average,
          genres: show.genre_ids,
          description_full: show.overview,
          language: show.original_language,
          id: show.id
        })));
        renderPagination();
        errorContainer.innerHTML = '';
      } else {
        showError('No cartoons found');
      }
      return;
    } else {
      if (currentType === 'movies') {
        endpoint = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&page=${currentPage}`;
      } else {
        endpoint = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=${currentPage}`;
      }
      const response = await fetch(endpoint, currentType === 'tv' ? TMDB_OPTIONS : undefined);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      if (currentType === 'tv') {
        totalPages = data.total_pages;
        if (data.results.length > 0) {
          displayResults(data.results.map(show => ({
            title: show.name,
            year: new Date(show.first_air_date).getFullYear(),
            medium_cover_image: show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : '',
            large_cover_image: show.poster_path ? `https://image.tmdb.org/t/p/original${show.poster_path}` : '',
            rating: show.vote_average,
            genres: show.genre_ids,
            description_full: show.overview,
            language: show.original_language,
            id: show.id
          })));
          renderPagination();
          errorContainer.innerHTML = '';
        } else {
          showError('No TV shows found');
        }
      } else {
        if (data.status === 'ok' && data.data.movies) {
          totalPages = Math.ceil(data.data.movie_count / data.data.limit);
          displayResults(data.data.movies);
          renderPagination();
          errorContainer.innerHTML = '';
        } else {
          showError('No movies found');
        }
      }
    }
  } catch (error) {
    showError(error.message);
  }
}
function displayResults(items) {
  resultsContainer.style.opacity = '0';
  resultsContainer.style.transform = 'translateY(20px)';
  resultsContainer.innerHTML = '';
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px) rotateX(5deg)';
    card.style.animationDelay = `${index * 100}ms`;
    try {
      const escapedItem = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "\\'");
      card.innerHTML = `
                <img class="movie-poster" src="${item.medium_cover_image || ''}" 
                     alt="${item.title || 'Poster'}"
                     loading="lazy">
                <div class="movie-info">
                    <h3 class="movie-title">${item.title || 'Unknown'} (${item.year || 'N/A'})</h3>
                    <div class="movie-buttons">
                        <button class="btn btn-watch" onclick="showWatchEmbed(JSON.parse(decodeURIComponent('${escapedItem}')))">Watch</button>
                        <button class="btn btn-trailer" onclick="showTrailer(JSON.parse(decodeURIComponent('${escapedItem}')))">Trailer</button>
                        <button class="btn btn-details" onclick="showMovieDetails(JSON.parse(decodeURIComponent('${escapedItem}')))">Info</button>
                        ${currentType === 'movies' ? `
                        <button class="btn btn-download" onclick="showDownloadOptions(JSON.parse(decodeURIComponent('${escapedItem}')))">Download</button>
                        ` : ''}
                    </div>
                </div>
            `;
      resultsContainer.appendChild(card);
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0) rotateX(0)';
            }, 50 * index);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1
      });
      observer.observe(card);
    } catch (error) {
      console.error('Error creating card:', error);
      showError('Error displaying some results');
    }
  });
  setTimeout(() => {
    resultsContainer.style.transition = 'all 0.5s ease-out';
    resultsContainer.style.opacity = '1';
    resultsContainer.style.transform = 'translateY(0)';
  }, 100);
}
async function showMovieDetails(item) {
  if (!item) {
    showError('Details not available');
    return;
  }
  const detailsButton = event?.target;
  if (detailsButton) {
    detailsButton.classList.add('loading');
  }
  let details = item;
  if (currentType === 'tv') {
    try {
      const [showResponse, episodesResponse, creditsResponse] = await Promise.all([fetch(`https://api.themoviedb.org/3/tv/${item.id}?language=en-US`, TMDB_OPTIONS), fetch(`https://api.themoviedb.org/3/tv/${item.id}/season/1?language=en-US`, TMDB_OPTIONS), fetch(`https://api.themoviedb.org/3/tv/${item.id}/credits?language=en-US`, TMDB_OPTIONS)]);
      
      if (!showResponse.ok || !episodesResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to fetch show details');
      }
      
      const showData = await showResponse.json();
      const episodes = await episodesResponse.json();
      const credits = await creditsResponse.json();
      
      details = {
        ...item,
        episodes: episodes.episodes,
        status: showData.status,
        network: showData.networks?.[0]?.name,
        genres: showData.genres.map(g => g.name),
        first_air_date: showData.first_air_date,
        last_air_date: showData.last_air_date,
        number_of_seasons: showData.number_of_seasons,
        number_of_episodes: showData.number_of_episodes,
        cast: credits.cast,
        crew: credits.crew
      };
    } catch (error) {
      console.error('Error fetching show details:', error);
      showError('Failed to load complete show details');
    } finally {
      if (detailsButton) {
        detailsButton.classList.remove('loading');
      }
    }
  } else {
    try {
      const creditsResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${item.imdb_code}/credits?language=en-US`, 
        TMDB_OPTIONS
      );
      if (!creditsResponse.ok) {
        throw new Error('Failed to fetch credits');
      }
      const credits = await creditsResponse.json();
      details.cast = credits.cast;
      details.crew = credits.crew;
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  }

  modalBody.innerHTML = `
        <div class="modal-header">
            <button type="button" class="close-modal" aria-label="Close modal">×</button>
            <img class="modal-poster" src="${details.large_cover_image || ''}" alt="${details.title || 'Movie poster'}">
            <div class="modal-info">
                <h2 class="modal-title">${details.title || 'Unknown'} (${details.year || 'N/A'})</h2>
                <div class="movie-buttons">
                    <button class="btn btn-watch" onclick="showWatchEmbed(${JSON.stringify(details)})">Watch Now</button>
                    <button class="btn btn-trailer" onclick="showTrailer(${JSON.stringify(details)})">Watch Trailer</button>
                    <button class="btn btn-details">Info</button>
                </div>
                <p class="modal-description">${details.description_full || 'No description available.'}</p>
                <div class="modal-metadata">
                    <div class="metadata-item">
                        <div class="metadata-label">Rating</div>
                        <div class="metadata-value">${details.rating || 'N/A'}/10</div>
                    </div>
                    ${currentType === 'tv' ? `
                        <div class="metadata-item">
                            <div class="metadata-label">Status</div>
                            <div class="metadata-value">${details.status || 'N/A'}</div>
                        </div>
                        <div class="metadata-item">
                            <div class="metadata-label">Network</div>
                            <div class="metadata-value">${details.network || 'N/A'}</div>
                        </div>
                        <div class="metadata-item">
                            <div class="metadata-label">Seasons</div>
                            <div class="metadata-value">${details.number_of_seasons || 'N/A'}</div>
                        </div>
                        <div class="metadata-item">
                            <div class="metadata-label">Episodes</div>
                            <div class="metadata-value">${details.number_of_episodes || 'N/A'}</div>
                        </div>
                        <div class="metadata-item">
                            <div class="metadata-label">First Aired</div>
                            <div class="metadata-value">${details.first_air_date ? new Date(details.first_air_date).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    ` : ''}
                    <div class="metadata-item">
                        <div class="metadata-label">Genre</div>
                        <div class="metadata-value">${details.genres?.join(', ') || 'N/A'}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">Language</div>
                        <div class="metadata-value">${details.language?.toUpperCase() || 'N/A'}</div>
                    </div>
                </div>
                ${currentType === 'tv' && details.episodes ? `
                    <div class="episodes-list">
                        <h3>Episodes</h3>
                        <div class="episodes-grid">
                            ${details.episodes.map(ep => `
                                <div class="episode-item">
                                    <div class="episode-title">S${ep.season_number}E${ep.episode_number}: ${ep.name}</div>
                                    <div class="episode-air-date">Aired: ${new Date(ep.air_date).toLocaleDateString()}</div>
                                    <div class="episode-overview">${ep.overview || 'No description available.'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
  if (details.cast?.length > 0) {
    modalBody.querySelector('.modal-info').insertAdjacentHTML('afterbegin', `
        <div class="cast-section">
            <h3 class="cast-title">Top Cast</h3>
            <div class="cast-grid">
                ${details.cast.slice(0, 6).map(actor => `
                    <div class="cast-card">
                        <img 
                            class="cast-image" 
                            src="${actor.profile_path ? 
                                'https://image.tmdb.org/t/p/w200' + actor.profile_path : 
                                'https://via.placeholder.com/200x200'}"
                            alt="${actor.name}"
                            loading="lazy"
                        >
                        <div class="cast-name">${actor.name}</div>
                        <div class="cast-character">${actor.character}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `);
  }
  modalBody.querySelector('.modal-info').insertAdjacentHTML('afterbegin', `
    <div class="storyline-section">
        <h3 class="storyline-title">Storyline</h3>
        <div class="storyline-content">
            ${details.description_full || 'No storyline available.'}
        </div>
        ${(details.description_full && details.description_full.length > 300) ? 
            `<button class="storyline-expand">Show more</button>` : ''}
    </div>
`);
  const expandBtn = modalBody.querySelector('.storyline-expand');
  if (expandBtn) {
    let expanded = false;
    const storylineContent = modalBody.querySelector('.storyline-content');
    const originalHeight = storylineContent.scrollHeight;
    storylineContent.style.maxHeight = '100px';
    storylineContent.style.overflow = 'hidden';
    storylineContent.style.transition = 'max-height 0.3s ease';

    expandBtn.addEventListener('click', () => {
      expanded = !expanded;
      storylineContent.style.maxHeight = expanded ? `${originalHeight}px` : '100px';
      expandBtn.textContent = expanded ? 'Show less' : 'Show more';
    });
  }
  modal.style.display = 'block';
  setTimeout(() => {
    document.querySelectorAll('.metadata-item').forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
    });
  }, 100);
}
async function showWatchEmbed(item) {
    if (!item) {
        showError('Watch options not available');
        return;
    }

    const watchButton = event?.target;
    if (watchButton) {
        watchButton.classList.add('loading');
    }

    let embedUrl;
    if (currentType === 'cartoon') {
        embedUrl = `https://vidsrc.xyz/embed/tv/${item.id}`;
    } else {
        embedUrl = `https://vidsrc.xyz/embed/${currentType === 'tv' ? 'tv' : 'movie'}/${currentType === 'tv' ? item.id : item.imdb_code}`;
    }

    modalBody.innerHTML = `
        <div class="modal-header">
            <button type="button" class="close-modal" aria-label="Close modal">×</button>
            <h2 class="watch-title">Now Playing: ${item.title || 'Unknown'} (${item.year || 'N/A'})</h2>
        </div>
        <div class="watch-embed">
            <div class="ad-overlay">
                <div class="countdown">5</div>
                <div class="ad-message">Video will play after advertisement</div>
                <button class="skip-button">Skip Ad</button>
            </div>
            <iframe
                src="${embedUrl}"
                frameborder="0"
                allowfullscreen
                onload="this.parentElement.classList.add('loaded')">
            </iframe>
        </div>
    `;

    if (item.description_full) {
        modalBody.querySelector('.watch-embed').insertAdjacentHTML('afterend', `
            <div class="storyline-section">
                <h3 class="storyline-title">About this title</h3>
                <div class="storyline-content">
                    ${item.description_full}
                </div>
                ${item.description_full.length > 300 ? 
                    `<button class="storyline-expand">Show more</button>` : ''}
            </div>
        `);

        const expandBtn = modalBody.querySelector('.storyline-expand');
        if (expandBtn) {
            let expanded = false;
            const storylineContent = modalBody.querySelector('.storyline-content');
            const originalHeight = storylineContent.scrollHeight;
            storylineContent.style.maxHeight = '100px';
            storylineContent.style.overflow = 'hidden';
            storylineContent.style.transition = 'max-height 0.3s ease';

            expandBtn.addEventListener('click', () => {
                expanded = !expanded;
                storylineContent.style.maxHeight = expanded ? `${originalHeight}px` : '100px';
                expandBtn.textContent = expanded ? 'Show less' : 'Show more';
            });
        }
    }

    modal.style.display = 'block';

    const iframe = modalBody.querySelector('iframe');
    const adOverlay = modalBody.querySelector('.ad-overlay');
    const countdown = modalBody.querySelector('.countdown');
    const skipButton = modalBody.querySelector('.skip-button');

    let timeLeft = 5;
    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdown.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            skipButton.classList.add('active');
            skipButton.textContent = 'Skip Ad Now';
        }
    }, 1000);

    skipButton.addEventListener('click', () => {
        if (timeLeft <= 0) {
            adOverlay.remove();
            clearInterval(countdownInterval);
        }
    });

    iframe.addEventListener('load', () => {
        if (watchButton) {
            watchButton.classList.remove('loading');
        }
    });

    iframe.addEventListener('error', () => {
        if (watchButton) {
            watchButton.classList.remove('loading');
        }
        closeModal();
        showError('Failed to load video player');
    });

    modal.addEventListener('hidden', () => {
        clearInterval(countdownInterval);
        closeModal();
    }, { once: true });
}
async function showTrailer(item) {
  if (!item) {
    showError('Trailer not available');
    return;
  }

  const trailerButton = event?.target;
  if (trailerButton) {
    trailerButton.classList.add('loading');
  }

  try {
    let trailerId;
    if (currentType === 'tv' || currentType === 'cartoon') {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${item.id}/videos?language=en-US`, 
        TMDB_OPTIONS
      );
      const data = await response.json();
      trailerId = data.results.find(v => v.type === 'Trailer')?.key;
    } else {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${item.imdb_code}/videos?language=en-US`, 
        TMDB_OPTIONS
      );
      const data = await response.json();
      trailerId = data.results.find(v => v.type === 'Trailer')?.key;
    }

    if (!trailerId) {
      throw new Error('No trailer available');
    }

    modalBody.innerHTML = `
      <div class="modal-header">
        <button type="button" class="close-modal" aria-label="Close modal">×</button>
        <h2 class="modal-title">Trailer: ${item.title || 'Unknown'}</h2>
      </div>
      <div class="trailer-embed">
        <iframe
          src="https://www.youtube.com/embed/${trailerId}?autoplay=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          onload="this.parentElement.classList.add('loaded')">
        </iframe>
      </div>
    `;

  } catch (error) {
    showError('Trailer not available');
  } finally {
    if (trailerButton) {
      trailerButton.classList.remove('loading');
    }
  }

  modal.style.display = 'block';
}
function showError(message) {
  errorContainer.innerHTML = `
                <div class="error">
                    ${message}
                </div>
            `;
}
function showDownloadOptions(movie) {
    if (!movie || !movie.torrents) {
        showError('Download options not available');
        return;
    }

    modalBody.innerHTML = `
        <div class="modal-header">
            <button type="button" class="close-modal" aria-label="Close modal">×</button>
            <div class="small-download-modal">
                <h3>Download Options</h3>
                <div class="small-download-options">
                    ${movie.torrents.map(torrent => `
                        <div class="small-download-item">
                            <div class="small-download-info">
                                <div class="small-download-quality">${torrent.quality}</div>
                                <div class="small-download-stats">
                                    ${torrent.size} | S:${torrent.seeds} P:${torrent.peers}
                                </div>
                            </div>
                            <button class="small-download-button" onclick="startDownload('${torrent.url}', this)">
                                Download
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}
function startDownload(url, button) {
    button.classList.add('loading');
    button.disabled = true;

    setTimeout(() => {
        button.classList.remove('loading');
        button.disabled = false;
        
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noopener noreferrer';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, 1500);
}
async function loadPopular() {
  try {
    if (currentType === 'movies') {
      const response = await fetch(`https://yts.mx/api/v2/list_movies.json?sort_by=download_count&page=${currentPage}`);
      const data = await response.json();
      if (data.status === 'ok' && data.data.movies) {
        totalPages = Math.ceil(data.data.movie_count / data.data.limit);
        displayResults(data.data.movies);
        renderPagination();
      }
    } else if (currentType === 'cartoon') {
      await loadLatestTVShows(currentPage);
    } else {
      await loadLatestTVShows(currentPage);
    }
  } catch (error) {
    showError(`Failed to load popular ${currentType}`);
  }
}
window.onload = () => {
  document.body.style.opacity = '1';
  loadPopular();
  document.querySelector('[data-type="movies"]').classList.add('active');
  loadLatestTVShows(1);
  renderPagination();
  resultsContainer.style.opacity = '0';
  resultsContainer.style.transform = 'translateY(20px)';
  setTimeout(() => {
    resultsContainer.style.transition = 'all 0.6s ease-out';
    resultsContainer.style.opacity = '1';
    resultsContainer.style.transform = 'translateY(0)';
  }, 300);
  document.addEventListener('click', e => {
    if (e.target.matches('.pagination button')) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });
  initBackground();
  document.querySelectorAll('.type-button').forEach(button => {
    if (button.dataset.type === 'movies') {
      button.classList.add('active');
    }
    
    button.addEventListener('mouseenter', () => {
      if (!button.classList.contains('active')) {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 12px rgba(0,99,229,0.2)';
      }
    });
    
    button.addEventListener('mouseleave', () => {
      if (!button.classList.contains('active')) {
        button.style.transform = 'none';
        button.style.boxShadow = 'none';
      }
    });
  });
};
function animateHomeElements() {
  const siteName = document.querySelector('.site-name');
  siteName.addEventListener('mousemove', e => {
    const bounds = siteName.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    const angleX = (mouseY - centerY) / 15;
    const angleY = (mouseX - centerX) / 15;
    siteName.style.transform = `perspective(1000px) rotateX(${-angleX}deg) rotateY(${angleY}deg) scale(1.1)`;
    siteName.style.textShadow = `
      ${angleY / 2}px ${angleX / 2}px 5px rgba(0,99,229,0.3),
      ${-angleY / 2}px ${-angleX / 2}px 5px rgba(0,0,0,0.3)
    `;
  });
  siteName.addEventListener('mouseleave', () => {
    siteName.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    siteName.style.textShadow = '2px 2px 4px rgba(0,99,229,0.2)';
  });
  const background2 = document.querySelector('.animated-background');
  if (background2) {
    background2.style.animation = 'introFadeIn 1.5s ease-out forwards';
  }
}
function renderPagination() {
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination';
  
  // Adjust number of visible page numbers based on screen width
  const maxVisiblePages = window.innerWidth <= 480 ? 3 : 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  let paginationHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
        <div class="page-numbers">
    `;
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>
        `;
  }
  paginationHTML += `
        </div>
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
    `;
  paginationContainer.innerHTML = paginationHTML;
  document.querySelector('.pagination')?.remove();
  resultsContainer.after(paginationContainer);
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('close-modal') || e.target === modal) {
    closeModal();
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    searchMovies(query);
  }
});
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    }
  }
});
function closeModal() {
  modal.style.display = 'none';
  modalBody.innerHTML = '';
  document.querySelectorAll('.btn-watch').forEach(btn => {
    btn.classList.remove('loading');
  });
  const intervals = window.setInterval(function () {}, Number.MAX_SAFE_INTEGER);
  for (let i = 1; i < intervals; i++) {
    window.clearInterval(i);
  }
}
function initBackground() {
  const background = document.querySelector('.animated-background');
  if (!background) return;
  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 6 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 0.5) * 200;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.animation = `float-particle ${Math.random() * 3 + 2}s linear forwards`;
    return particle;
  }
  for (let i = 0; i < 50; i++) {
    background.appendChild(createParticle());
  }
  setInterval(() => {
    const particle = createParticle();
    background.appendChild(particle);
    particle.addEventListener('animationend', () => {
      particle.remove();
    });
  }, 200);
  document.addEventListener('mousemove', e => {
    const background = document.querySelector('.animated-background');
    if (!background) return;
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    background.style.transform = `translate(${mouseX * -20}px, ${mouseY * -20}px)`;
  });
  window.addEventListener('resize', () => {
    const particleCount = Math.min(50, Math.floor(window.innerWidth * window.innerHeight / 20000));
    while (background.children.length > particleCount) {
      background.removeChild(background.lastChild);
    }
  });
  const cartoonShapes = [];
  for (let i = 0; i < 15; i++) {
    const shape = document.createElement('div');
    shape.className = 'cartoon-particle';
    shape.style.width = Math.random() * 20 + 10 + 'px';
    shape.style.height = shape.style.width;
    shape.style.border = '3px solid ' + `hsl(${Math.random() * 360}, 70%, 60%)`;
    shape.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    shape.style.left = startX + 'px';
    shape.style.top = startY + 'px';
    shape.style.setProperty('--tx', (Math.random() - 0.5) * 300 + 'px');
    shape.style.setProperty('--ty', (Math.random() - 0.5) * 300 + 'px');
    shape.style.setProperty('--tr', Math.random() * 360 + 'deg');
    shape.style.animation = `float-cartoon ${Math.random() * 4 + 6}s infinite ease-in-out`;
    cartoonShapes.push(shape);
    background.appendChild(shape);
  }
  document.addEventListener('mousemove', e => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    background.style.transform = `translate(${mouseX * -20}px, ${mouseY * -20}px)`;
    cartoonShapes.forEach(shape => {
      const rect = shape.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < 200) {
        const angle = Math.atan2(distY, distX);
        const force = (200 - distance) / 200;
        shape.style.transform = `translate(
          ${Math.cos(angle) * force * -30}px,
          ${Math.sin(angle) * force * -30}px
        )`;
        shape.style.opacity = Math.min(1, force + 0.2);
      } else {
        shape.style.transform = '';
        shape.style.opacity = '';
      }
    });
  });

  window.addEventListener('resize', () => {
    cartoonShapes.forEach(shape => {
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      shape.style.left = startX + 'px';
      shape.style.top = startY + 'px';
    });
  });
  const ben10Symbols = ['⚡', '🔄', '👽', '⚙️', 'BEN', '10', '🕒'];
  const ben10Particles = [];

  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'ben10-particle';
    particle.textContent = ben10Symbols[Math.floor(Math.random() * ben10Symbols.length)];
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    particle.style.left = startX + 'px';
    particle.style.top = startY + 'px';
    
    particle.style.setProperty('--tx', (Math.random() - 0.5) * 400 + 'px');
    particle.style.setProperty('--ty', (Math.random() - 0.5) * 400 + 'px');
    particle.style.setProperty('--tr', Math.random() * 360 + 'deg');
    
    particle.style.animation = `ben10-float ${Math.random() * 4 + 6}s infinite ease-in-out`;
    
    ben10Particles.push(particle);
    background.appendChild(particle);
  }

  const omnitrixGlow = document.createElement('div');
  omnitrixGlow.className = 'omnitrix-glow';
  background.appendChild(omnitrixGlow);

  document.addEventListener('mousemove', e => {
    const background = document.querySelector('.animated-background');
    if (!background) return;
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    background.style.transform = `translate(${mouseX * -20}px, ${mouseY * -20}px)`;
    omnitrixGlow.style.left = e.clientX - 50 + 'px';
    omnitrixGlow.style.top = e.clientY - 50 + 'px';
    omnitrixGlow.style.opacity = '1';
    ben10Particles.forEach(particle => {
      const rect = particle.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < 200) {
        const angle = Math.atan2(distY, distX);
        const force = (200 - distance) / 200;
        particle.style.transform = `translate(
          ${Math.cos(angle) * force * -40}px,
          ${Math.sin(angle) * force * -40}px
        ) scale(${1 + force * 0.3})`;
        particle.style.opacity = Math.min(1, force + 0.4);
      } else {
        particle.style.transform = '';
        particle.style.opacity = '';
      }
    });
  });

  document.addEventListener('mouseleave', () => {
    omnitrixGlow.style.opacity = '0';
  });

  window.addEventListener('resize', () => {
    ben10Particles.forEach(particle => {
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight; 
      particle.style.left = startX + 'px';
      particle.style.top = startY + 'px';
    });
  });
  
  const adventureTimeSymbols = ['⚔️', '🗡️', '👑', '🌟', 'FINN', 'JAKE', '🎒', '🌈'];
  const adventureParticles = [];

  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'adventure-time-particle';
    particle.textContent = adventureTimeSymbols[Math.floor(Math.random() * adventureTimeSymbols.length)];
    particle.style.color = Math.random() > 0.5 ? '#00aaff' : '#ffd500';
    
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    particle.style.left = startX + 'px';
    particle.style.top = startY + 'px';
    
    particle.style.setProperty('--tx', (Math.random() - 0.5) * 400 + 'px');
    particle.style.setProperty('--ty', (Math.random() - 0.5) * 400 + 'px');
    particle.style.setProperty('--tr', Math.random() * 360 + 'deg');
    
    particle.style.animation = `adventure-float ${Math.random() * 4 + 6}s infinite ease-in-out`;
    
    adventureParticles.push(particle);
    background.appendChild(particle);
  }

  const finnJakeGlow = document.createElement('div');
  finnJakeGlow.className = 'finn-jake-glow';
  background.appendChild(finnJakeGlow);

  document.addEventListener('mousemove', e => {
    const background = document.querySelector('.animated-background');
    if (!background) return;
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    background.style.transform = `translate(${mouseX * -20}px, ${mouseY * -20}px)`;
    
    finnJakeGlow.style.left = e.clientX - 50 + 'px';
    finnJakeGlow.style.top = e.clientY - 50 + 'px';
    finnJakeGlow.style.opacity = '1';

    adventureParticles.forEach(particle => {
      const rect = particle.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < 200) {
        const angle = Math.atan2(distY, distX);
        const force = (200 - distance) / 200;
        particle.style.transform = `translate(
          ${Math.cos(angle) * force * -40}px,
          ${Math.sin(angle) * force * -40}px
        ) scale(${1 + force * 0.3})`;
        particle.style.opacity = Math.min(1, force + 0.4);
      } else {
        particle.style.transform = '';
        particle.style.opacity = '';
      }
    });
  });

  document.addEventListener('mouseleave', () => {
    finnJakeGlow.style.opacity = '0';
  });

  window.addEventListener('resize', () => {
    adventureParticles.forEach(particle => {
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      particle.style.left = startX + 'px';
      particle.style.top = startY + 'px';
    });
  });
  
  const movieSymbols = ['🎬', '🎥', '🎦', '🎭', '🍿', '🎪', '🎫', 'ACTION!', 'CUT!'];
  const movieParticles = [];

  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'movie-particle';
    particle.textContent = movieSymbols[Math.floor(Math.random() * movieSymbols.length)];
    
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    particle.style.left = startX + 'px';
    particle.style.top = startY + 'px';
    
    particle.style.setProperty('--tx', (Math.random() - 0.5) * 400 + 'px');
    particle.style.setProperty('--ty', (Math.random() - 0.5) * 400 + 'px');
    particle.style.setProperty('--tr', Math.random() * 360 + 'deg');
    
    particle.style.animation = `movie-float ${Math.random() * 4 + 6}s infinite ease-in-out`;
    
    movieParticles.push(particle);
    background.appendChild(particle);
  }

  const cinemaGlow = document.createElement('div');
  cinemaGlow.className = 'cinema-glow';
  background.appendChild(cinemaGlow);

  document.addEventListener('mousemove', e => {
    const background = document.querySelector('.animated-background');
    if (!background) return;
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    background.style.transform = `translate(${mouseX * -20}px, ${mouseY * -20}px)`;
    
    cinemaGlow.style.left = e.clientX - 50 + 'px';
    cinemaGlow.style.top = e.clientY - 50 + 'px';
    cinemaGlow.style.opacity = '1';

    movieParticles.forEach(particle => {
      const rect = particle.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < 200) {
        const angle = Math.atan2(distY, distX);
        const force = (200 - distance) / 200;
        particle.style.transform = `translate(
          ${Math.cos(angle) * force * -40}px,
          ${Math.sin(angle) * force * -40}px
        ) scale(${1 + force * 0.3})`;
        particle.style.opacity = Math.min(1, force + 0.4);
      } else {
        particle.style.transform = '';
        particle.style.opacity = '';
      }
    });
  });

  document.addEventListener('mouseleave', () => {
    cinemaGlow.style.opacity = '0';
  });

  window.addEventListener('resize', () => {
    movieParticles.forEach(particle => {
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      particle.style.left = startX + 'px';
      particle.style.top = startY + 'px';
    });
  });
}
window.addEventListener('scroll', () => {
  const cards = document.querySelectorAll('.movie-card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible) {
      const distance = window.innerHeight - rect.top;
      const parallax = Math.min(15, Math.max(-15, (distance - window.innerHeight / 2) / 30));
      card.style.transform = `perspective(1000px) translateY(${-parallax}px) rotateX(${parallax / 2}deg)`;
    }
  });
});
document.addEventListener('click', e => {
    if (e.target.classList.contains('btn-watch')) {
        e.target.classList.add('loading');
        setTimeout(() => {
            e.target.classList.remove('loading');
        }, 1500);
    }
});
window.addEventListener('resize', () => {
  // Update grid layout
  const grid = document.querySelector('.movies-grid');
  if (grid) {
    const width = window.innerWidth;
    if (width <= 480) {
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(130px, 1fr))';
    } else if (width <= 768) {
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    } else {
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }

  // Update button layout
  const buttons = document.querySelectorAll('.movie-buttons');
  buttons.forEach(buttonGroup => {
    if (window.innerWidth <= 480) {
      buttonGroup.style.flexDirection = 'column';
    } else {
      buttonGroup.style.flexDirection = 'row';
    }
  });

  // Adjust modal content
  const modalContent = document.querySelector('.modal-content');
  if (modalContent) {
    modalContent.style.width = window.innerWidth <= 768 ? '95%' : '90%';
  }
});
