const cloudinary = require('cloudinary').v2;
require('dotenv').config()

const api_secret = process.env.API_SECRET
const api_key = process.env.API_KEY
const api_cloudname = process.env.CLOUD_NAME

cloudinary.config({
    cloud_name: api_cloudname,
    api_key: api_key,
    api_secret: api_secret
})

module.exports = cloudinary