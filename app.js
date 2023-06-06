require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const apiRouter = require('./routes/api');

// Connecting to MongoDB
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => console.error(err));
db.on('open', () => console.log('Successfully connected to the database!'));

const app = express();
app.use(express.json());

// Authentication
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        console.log(err)
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
});

app.use('/api', apiRouter);

app.listen(process.env.PORT, () => {
  console.log('Server started on port:' + process.env.PORT);
});
