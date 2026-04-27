const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for bookings (in production, use a database)
let bookings = [];
let bookingIdCounter = 1;

// API Routes
app.get('/api/movies', (req, res) => {
    const movies = require('./public/js/movies-data.json');
    res.json(movies);
});

app.post('/api/bookings', (req, res) => {
    const booking = {
        id: bookingIdCounter++,
        ...req.body,
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
    };
    bookings.push(booking);
    res.json({ success: true, bookingId: booking.id, booking });
});

app.get('/api/bookings/:id', (req, res) => {
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    if (booking) {
        res.json(booking);
    } else {
        res.status(404).json({ error: 'Booking not found' });
    }
});

app.post('/api/payment', (req, res) => {
    // Simulate payment processing
    setTimeout(() => {
        res.json({ 
            success: true, 
            transactionId: 'TXN' + Date.now(),
            message: 'Payment successful'
        });
    }, 1000);
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0' ,() => {
    console.log(`Movie tickets app running on http://localhost:${PORT}`);
});
