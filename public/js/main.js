// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedMovies();
    setupEventListeners();
    setupAnimations();
    loadUserBookings();
});

// Load featured movies
async function loadFeaturedMovies() {
    try {
        const response = await fetch('/api/movies');
        const data = await response.json();
        const featuredMovies = data.movies.slice(0, 3);
        
        const container = document.getElementById('featuredMovies');
        if (container) {
            container.innerHTML = featuredMovies.map(movie => `
                <div class="movie-card" onclick="bookMovie(${movie.id})">
                    <div class="movie-poster">${movie.poster}</div>
                    <div class="movie-info">
                        <div class="movie-title">${movie.title}</div>
                        <div class="movie-details">
                            <span>${movie.genre}</span>
                            <span>${movie.duration}</span>
                        </div>
                        <div class="movie-rating">
                            <i class="fas fa-star"></i>
                            <span>${movie.rating}</span>
                        </div>
                        <div class="movie-price">₹${movie.price}</div>
                        <button class="book-btn">
                            <i class="fas fa-ticket-alt"></i>
                            Book Now
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        showToast('Failed to load movies', 'error');
    }
}

function bookMovie(movieId) {
    localStorage.setItem('selectedMovieId', movieId);
    window.location.href = '/booking.html';
}

// Setup event listeners
function setupEventListeners() {
    // Watch trailer button
    const watchTrailerBtn = document.getElementById('watchTrailer');
    if (watchTrailerBtn) {
        watchTrailerBtn.addEventListener('click', () => {
            showToast('🎬 Trailer feature coming soon!', 'info');
        });
    }
    
    // Newsletter subscription
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input').value;
            showToast(`✅ Subscribed with ${email}!`, 'success');
            e.target.reset();
        });
    }
    
    // My Bookings modal
    const myBookingsLink = document.getElementById('myBookingsLink');
    const modal = document.getElementById('bookingsModal');
    const closeBtn = document.querySelector('.close');
    
    if (myBookingsLink) {
        myBookingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            displayBookings();
            modal.style.display = 'block';
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
}

// Display user bookings
async function displayBookings() {
    try {
        const response = await fetch('/api/bookings');
        const bookings = await response.json();
        const bookingsList = document.getElementById('bookingsList');
        
        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-ticket-alt" style="font-size: 3rem; color: var(--gray);"></i>
                    <p style="margin-top: 1rem;">No bookings found. Start booking your favorite movies!</p>
                    <a href="/movies.html" class="btn-primary" style="display: inline-block; margin-top: 1rem;">
                        Browse Movies
                    </a>
                </div>
            `;
            return;
        }
        
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3><i class="fas fa-film"></i> ${booking.movieTitle}</h3>
                        <p><i class="fas fa-chair"></i> Seats: ${booking.seats.join(', ')}</p>
                        <p><i class="fas fa-clock"></i> Show Time: ${booking.showTime || '7:00 PM'}</p>
                        <p><i class="fas fa-calendar"></i> Date: ${new Date(booking.bookingDate).toLocaleDateString()}</p>
                        <p><i class="fas fa-tag"></i> Total: ₹${booking.totalPrice}</p>
                        <p><i class="fas fa-qrcode"></i> Booking ID: ${booking.bookingId}</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="background: var(--success); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem;">
                            ${booking.status}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading bookings:', error);
        showToast('Failed to load bookings', 'error');
    }
}

// Load user bookings from localStorage (for demo)
function loadUserBookings() {
    const localBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    if (localBookings.length > 0) {
        // Sync localStorage bookings with server
        localBookings.forEach(booking => {
            fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking)
            }).catch(console.error);
        });
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? 'var(--success)' : 
                                 type === 'error' ? 'var(--danger)' : 'var(--primary)';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Setup scroll animations
function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.feature-card, .movie-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Add to window for global access
window.bookMovie = bookMovie;
window.showToast = showToast;
