const express = require('express');
const router = express.Router();

// const nodemailer = require('nodemailer');
const path = require('path');
const { Pool } = require('pg');
const { createCanvas } = require("canvas");

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

// Protected route example
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        let first_name_letter = req.user.first_name.charAt(0);
        console.log(req.user.address);
        res.render('C:/Users/pruth/OneDrive/Desktop/SanChi/public/files/dashboard.ejs', {
            img_src: `/user/profile-pic?letter=${first_name_letter}`,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            username: req.user.username,
            email: req.user.email,
            age: req.user.age,
            address: req.user.address
        });
        
    } else {
        res.redirect('/auth/errorPage');
    }
});

router.get('/db_notes', async (req,res) => {
    let count = null;
    try {
        let result = await pool.query(`SELECT array_length(note_content, 1) AS array_length, note_content, note_color FROM notes WHERE user_id = $1;`, [1]);

        if (result.rowCount > 0) {
            count = result.rows[0].array_length;
            let note_content_array = result.rows[0].note_content;
            let note_color_array = result.rows[0].note_color;


            res.status(200).send({ 
                count: count,
                note_content_array: note_content_array,
                note_color_array: note_color_array
            });
        } else if(result.rows.length == 0) {
            res.status(200).send({ 
                no_rows: true
            });
            
        }
    } catch (error) {
        console.error(error);
    }
});

router.post('/notes', async (req, res) => {
    const userId = 1;
    console.log(req.body);

    const result = await pool.query(`SELECT notes_set_id FROM notes WHERE user_id = $1`, [userId]);
    console.log(result.rowCount);

    if (result.rowCount == 0) { //User has no set
        try {
            const response = await pool.query(`INSERT INTO notes (user_id, note_content, note_color) 
            VALUES
                ($1, ARRAY[$2], ARRAY[$3]) RETURNING *`, [userId, req.body.note_content, req.body.note_color]);

            if (response.rowCount > 0) {
                console.log('No Error storing');
            }
        } catch (error) {
            console.error(error);
        }
    } else {
        //First we will check if the Note Exists or not
        //If Note Exists, it will only be modified be or new Note will be created
        let note_id = req.body.note_id + 1;

        const result = await pool.query(`SELECT note_content[$1] FROM notes WHERE user_id=$2`, [note_id, userId]);

        console.log(result.rows[0].note_content);
        if (result.rows[0].note_content == null) {
            const { note_content, note_color } = req.body;

            if (!note_color) {
                note_color = 'rgb(254, 201, 167)';
            }

            await pool.query(`UPDATE notes
            SET note_content = array_remove(array_append(note_content, $1), NULL),
	                           note_color = array_append(note_color, $2)
            WHERE user_id = $3 RETURNING *`, [note_content, note_color, userId]);
        } else {
            try {
                const response = await pool.query(
                    `UPDATE notes
                SET note_content[$1] = $2 
                WHERE user_id = $3 RETURNING *`, [note_id, req.body.note_content, userId]);

                if (response.rowCount > 0) {
                    console.log(`No Error Updating`);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
});

// Function to generate profile picture
function generateProfilePic(letter) {
    const size = 200; // Canvas size (200x200 pixels)
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    // Draw a colored circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#4CAF50"; // Background color (e.g., green)
    ctx.fill();

    // Draw the letter
    ctx.fillStyle = "#FFFFFF"; // White text
    ctx.font = `${size * 0.5}px Arial`; // Font size (50% of canvas size)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, size / 2, size / 2);

    return canvas;
}

//Defining some Middleware
// Route to generate profile picture
router.get("/profile-pic", ensureAuthenticated, (req, res) => {
    const letter = req.query.letter || "A"; // Default letter is "A"
    const canvas = generateProfilePic(letter);

    // Send the image as a response
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

router.post('/deleteNote', async (req,res) => {
    const { note_id } = req.body;

    if(note_id >= 0) {
        pool.query(`UPDATE notes
            SET note_content = remove_array_element_by_index(note_content, $1),
                note_color = remove_array_element_by_index(note_color, $1)
            WHERE user_id = $2
            RETURNING *;`, [note_id, 1]);
    }
});

module.exports = router;