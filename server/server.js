const express = require('express');
const pool = require('./util/pool');
const cors = require('cors');
// const bcrypt = require('bcrypt');
require('dotenv').config();
// const nodemailer = require('./util/mailtransporter');
// const signuptemplate = require('./util/verificationtemplate');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const login = require("./routes/auth.js");
app.use("/api/auth", login);

const mail = require("./routes/mail.js");
app.use("/api/mail", mail);

const createQuiz = require("./routes/createQuiz.js");
app.use("/api/quizzes", createQuiz);

const user = require("./routes/user.js");
app.use("/api/user", user);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});