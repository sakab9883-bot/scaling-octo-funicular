const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const users = []; // In-memory user storage (consider using a database)
const payments = {}; // In-memory payment storage
const SECRET_KEY = 'your_secret_key'; // Replace with a more secure key in production

// User Registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    // Add validation and check if user already exists
    users.push({ username, password });
    res.status(201).send('User registered successfully!');
});

// User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).send('Invalid credentials');
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Payment Status Management
app.post('/payment', (req, res) => {
    const { username, amount } = req.body;
    // Process payment and update status (mocking here)
    const paymentId = Date.now();
    payments[paymentId] = { username, amount, status: 'completed' }; // Mock payment status
    res.status(200).send(`Payment processed with ID: ${paymentId}`);
});

// Middleware to check authentication
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.sendStatus(403);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Example protected route
app.get('/protected', authenticateJWT, (req, res) => {
    res.send('This is a protected route, accessible only to authenticated users.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
