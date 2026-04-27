let selectedMovie = null;
let selectedSeats = [];
let selectedShowtime = null;
const pricePerSeat = 250;

async function loadMovieDetails() {
    const movieId = localStorage.getItem('selectedMovieId');
    if (!movieId) {
        window.location.href = '/movies.html';
        return;
    }
    
    try {
        const response = await fetch(`/api/movies/${movieId}`);
        selectedMovie = await response.json();
        
        if (selectedMovie) {
            document.getElementById('movieTitle').textContent = selectedMovie.title;
            document.getElementById('movieDetails').innerHTML = `
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <span><i class="fas fa-tag"></i> ${selectedMovie.genre}</span>
                    <span><i class="fas fa-clock"></i> ${selectedMovie.duration}</span>
                    <span><i class="fas fa-star" style="color: var(--warning);"></i> ${selectedMovie.rating}</span>
                    <span><i class="fas fa-language"></i> ${selectedMovie.language}</span>
                </div>
                <div style="margin-top: 1rem;">
                    <strong>Description:</strong> ${selectedMovie.description}
                </div>
            `;
            
            // Setup showtimes
            setupShowtimes();
        }
    } catch (error) {
        console.error('Error loading movie:', error);
        showToast('Failed to load movie details', 'error');
    }
}

function setupShowtimes() {
    const container = document.getElementById('showtimeSelector');
    if (!selectedMovie.showtimes) return;
    
    container.innerHTML = selectedMovie.showtimes.map(time => `
        <button class="showtime-btn" onclick="selectShowtime('${time}')">
            ${time}
        </button>
    `).join('');
}

function selectShowtime(time) {
    selectedShowtime = time;
    document.querySelectorAll('.showtime-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === time) {
            btn.classList.add('selected');
        }
    });
    generateSeats();
}

function generateSeats() {
    if (!selectedShowtime) return;
    
    const container = document.getElementById('seatsContainer');
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 10;
    
    // Get booked seats for this movie and showtime
    const bookedSeatsKey = `booked_seats_${selectedMovie.id}_${selectedShowtime}`;
    const bookedSeats = JSON.parse(localStorage.getItem(bookedSeatsKey) || '[]');
    
    container.innerHTML = '';
    for (let row of rows) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        
        for (let i = 1; i <= seatsPerRow; i++) {
            const seatNumber = `${row}${i}`;
            const seat = document.createElement('div');
            seat.className = 'seat';
            if (bookedSeats.includes(seatNumber)) {
                seat.classList.add('booked');
            }
            seat.textContent = seatNumber;
            seat.onclick = () => toggleSeat(seat, seatNumber);
            rowDiv.appendChild(seat);
        }
        container.appendChild(rowDiv);
    }
}

function toggleSeat(seatElement, seatNumber) {
    if (seatElement.classList.contains('booked')) {
        showToast('This seat is already booked!', 'error');
        return;
    }
    
    if (seatElement.classList.contains('selected')) {
        seatElement.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s !== seatNumber);
    } else {
        seatElement.classList.add('selected');
        selectedSeats.push(seatNumber);
    }
    
    updateSummary();
}

function updateSummary() {
    const selectedSeatsSpan = document.getElementById('selectedSeats');
    const totalPriceSpan = document.getElementById('totalPrice');
    
    if (selectedSeats.length === 0) {
        selectedSeatsSpan.textContent = 'None';
    } else {
        selectedSeatsSpan.innerHTML = selectedSeats.map(seat => 
            `<span style="display: inline-block; background: var(--success); padding: 0.25rem 0.5rem; border-radius: 5px; margin: 0.25rem;">${seat}</span>`
        ).join('');
    }
    
    const total = selectedSeats.length * pricePerSeat;
    totalPriceSpan.textContent = total;
}

async function proceedToPayment() {
    if (selectedSeats.length === 0) {
        showToast('Please select at least one seat!', 'error');
        return;
    }
    
    if (!selectedShowtime) {
        showToast('Please select a showtime!', 'error');
        return;
    }
    
    const bookingData = {
        movieId: selectedMovie.id,
        movieTitle: selectedMovie.title,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * pricePerSeat,
        showTime: selectedShowtime,
        bookingDate: new Date().toISOString()
    };
    
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    window.location.href = '/payment.html';
}

// Event listeners
document.getElementById('proceedToPayment')?.addEventListener('click', proceedToPayment);

// Load movie details
loadMovieDetails();
