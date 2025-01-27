const express = require('express');
const router = express.Router();
const fs = require('fs');

// const nodemailer = require('nodemailer');
const path = require('path');
const { Pool } = require('pg');

const { ensureAuthenticated } = require('../routes/auth');

const pool = new Pool({
    host: 'localhost',
    user: process.env.DB_USER,
    port: 5432,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    max: 10, // Max number of users
    idleTimeoutMillis: 30000, // Stay idle for
    connectionTimeoutMillis: 2000,
});

router.get('/video', async (req, res) => {
    const response = await pool.query("SELECT * FROM videos");

    console.log(response.rows);

    res.render("videogrid.ejs", {videos: response.rows});
});

module.exports = router;