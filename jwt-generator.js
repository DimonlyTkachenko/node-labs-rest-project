// Just for JWT generation
// to generate token - "node .\jwt-generator.js"
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY; 

const payload = {
  sub: '1234567890',
  name: 'test name',
  iat: Math.floor(Date.now() / 1000),
};

const token = jwt.sign(payload, secretKey);

console.log(token);