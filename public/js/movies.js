let allMovies = [];
let currentFilter = 'all';
let currentSort = 'default';

async function loadAllMovies() {
    try {
        const response = await fetch('/api/movies');
        const data = await response.json();
        allMovies = data.movies;
        displayMovies(allMovies);
        setupFilters();
    } catch (error) {
        console.error('Error loading movies:', error);
        showToast('Failed to load movies', 'error');
    }
}

function displayMovies(movies) {
    const container = document.getElementById('allMovies');
    if (!container) return;
    
    if (movies.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem; grid-column: 1/-1;">
                <i class="fas fa-film" style="font-size: 4rem; color: var(--gray);"></i>
                <p style="margin-top: 1rem;">No movies found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="bookMovie(${movie.id})">
            <div class="movie-poster">${movie.poster}</div>
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-details">
                    <span><i class="fas fa-tag"></i> ${movie.genre}</span>
                    <span><i class="fas fa-clock"></i> ${movie.duration}</span>
                    <span><i class="fas fa-language"></i> ${movie.language}</span>
                </div>
                <div class="movie-rating">
                    <i class="fas fa-star" style="color: var(--warning);"></i>
                    <span>${movie.rating}</span>
                    <span style="color: var(--gray);">(${Math.floor(Math.random() * 1000) + 100} reviews)</span>
                </div>
                <div class="movie-price">
                    <span style="font-size: 1.5rem;">₹${movie.price}</span>
                    <span style="color: var(--gray); font-size: 0.875rem;">/person</span>
                </div>
                <div class="movie-showtimes" style="margin: 1rem 0;">
                    ${movie.showtimes.map(time => `
                        <span style="display: inline-block; padding: 0.25rem 0.5rem; background: var(--glass); border-radius: 5px; font-size: 0.75rem; margin-right: 0.5rem;">
                            ${time}
                        </span>
                    `).join('')}
                </div>
                <button class="book-btn">
                    <i class="fas fa-ticket-alt"></i>
                    Book Tickets
                </button>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    // Genre filter
    const genreFilter = document.getElementById('genreFilter');
    if (genreFilter) {
        genreFilter.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            applyFilters();
        });
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allMovies.filter(movie => 
                movie.title.toLowerCase().includes(searchTerm) ||
                movie.genre.toLowerCase().includes(searchTerm)
            );
            displayMovies(filtered);
        }, 300));
    }
}

function applyFilters() {
    let filtered = [...allMovies];
    
    // Apply genre filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(movie => movie.genre === currentFilter);
    }
    
    // Apply sorting
    switch(currentSort) {
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        default:
            // Default sort by id
            filtered.sort((a, b) => a.id - b.id);
    }
    
    displayMovies(filtered);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load movies when page loads
if (document.getElementById('allMovies')) {
    loadAllMovies();
}
