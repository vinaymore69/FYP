const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Pool } = require('pg');
const { randomUUID } = require('crypto');  // Correct import

const router = express.Router();

// Initialize disk storage with dynamic filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/contact_us_message'); // Specify the directory to store files
    },
    filename: (req, file, cb) => {
        // Generate a unique filename for each file
        const originalName = file.originalname;
        cb(null, `${originalName}`); // Save with original name
    }
});

const upload = multer({ storage: storage });

// Assuming you have already set up your PostgreSQL connection pool
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

router.use(express.static(path.join(__dirname, "public/files")));
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// router.set("view engine","ejs");

// router.get('/', (req, res) => {
//     // const data = 

//     res.send();
// });

router.post('/', upload.array('attachments[]'), async (req, res) => {
    try {
        const { email, title, message, first_name, last_name, file_names } = req.body;

        // Ensure file names are an array (if only one file is submitted, it might be a string)
        const fileNamesArray = Array.isArray(file_names) ? file_names : (file_names ? [file_names] : []);

        // Generate UUID4 for each file and construct new file names
        const uuidFileNames = req.files.map((file, index) => {
            const random = randomUUID().split('-')[0];

            const uuidFileName = fileNamesArray[index] || file.originalname; // Generate UUID4 for the file

            const uuidWithRandom = uuidFileName + '_' + random + path.extname(file.originalname);

            fs.rename(`./uploads/contact_us_message/${file.originalname}`, `./uploads/contact_us_message/${uuidWithRandom}`,
                (err) => {
                    if (err)
                        return `fs-error: ${err}`
                    console.log(`Working?`);
                });

            return uuidWithRandom;  // Append the original file extension
        });

        // Prepare file names (UUIDs) for database storage
        const fileNamesInDb = uuidFileNames.length ? uuidFileNames : null;

        // Create transporter for sending email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const emailBody = `You have received a message from ${first_name} ${last_name},\n${message}`;

        const mailOptions = {
            from: email,
            to: `pruthveesh.gharal@gmail.com`,
            subject: title,
            text: emailBody,
            // Attach files with the generated UUID4 file names
            attachments: req.files.map((file, index) => ({
                filename: uuidFileNames[index],  // Use the UUID as the filename for email attachment
                content: file.buffer,
            })),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);

        // Insert data into the database, storing only the file names (UUID4)
        const query = `INSERT INTO contact_us_messages 
            (first_name, last_name, user_email, title, message, attachment_file_names)
            VALUES ($1, $2, $3, $4, $5, $6)`;

        const data = [
            first_name,
            last_name,
            email,
            title,
            message,
            fileNamesInDb,  // Store only UUID file names in DB
        ];

        const result = await pool.query(query, data);

        if (result.rowCount > 0) {
            // If rowCount is greater than 0, the insert was successful
            res.status(200).send(`<p>Email sent and data saved successfully!<br><a href='http://localhost:3000/index.html'>Go to home page here</a></p>`);
        } else {
            // If rowCount is 0, no rows were inserted
            res.status(400).send('<p>Failed to save message to the database!<br><a href="http://localhost:3000/contact.html">Go back</a></p>');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(`<p>An error occurred!<br><a href='http://localhost:3000/contact.html'>Go back</a></p>`);
    }
});

module.exports = router;
