const express = require('express');
const path = require('path');
const app = express();

//https://github.com/WebDevSimplified/express-crash-course

app.use(express.static(path.join(__dirname,"public/files")));

app.listen(3000, console.log("http://localhost:3000"));