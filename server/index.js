const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const session = require('cookie-session');
const passport = require('passport');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./routes/auth');
const placeRoutes = require('./routes/place');
const reservationRoutes = require('./routes/reservation');
const favouriteRoutes = require('./routes/favourite');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

const app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false},
}));

app.use(passport.initialize());
app.use(passport.session());

// CORS error handling
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
}));

app.use('/auth', authRoutes);
app.use('/api', placeRoutes);
app.use('/api', reservationRoutes);
app.use('/api', favouriteRoutes)
app.use('/api', profileRoutes);
app.use('/api/admin', adminRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const mess = error.message;
    const data = error.data;
    res.status(status).json({message: mess, data: data});
});

mongoose.connect(process.env.MONGODB_URI)
    .then(result => {
        app.listen(process.env.PORT || 3000, () => {
            console.log('Server is running on port ' + process.env.PORT || '3000');
        })
    })
    .catch(err => console.log(err));