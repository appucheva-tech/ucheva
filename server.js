const express = require('express');
require('dotenv').config()

const redisClient = require('./config/redis')
const mongoose = require('mongoose');

const redis = require('./config/redis')
const morgan = require('morgan')
const PORT = 6699
const app = express()
app.use(morgan('dev'));

const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
const cors = require('cors')

const staffRouter = require('./router/staffRouter') 
const studentRouter = require('./router/studentRouter')
const adminRouter = require('./router/adminRouter')
const classRouter = require('./router/classRouter')
const subjectRouter =require('./router/subjectRouter')
const teacherRouter = require('./router/classTeacherRouter')
const subjectTeacherRouter = require('./router/subjectTeacherRouter')
const paymentRouter = require('./router/paymentRouter')
const staffAttendanceRouter = require('./router/staffAttendanceRouter')
const parentRouter = require('./router/parentRouter')
const announcementRouter = require('./router/announcementRouter')
const withdrawalRouter = require('./router/withdrawalRouter')
const bursaryRouter = require('./router/bursaryRouter')

app.use(cors())
app.use(express.json())
app.use('/api/v1/staff',staffRouter)
app.use('/api/v1/student',studentRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/class', classRouter)
app.use('/api/v1/subject', subjectRouter)
app.use('/api/v1/classteacher', teacherRouter)
app.use('/api/v1/subjectteacher', subjectTeacherRouter)
app.use('/api/v1/payment', paymentRouter)
app.use('/api/v1/parent', parentRouter)
app.use('/api/v1/staffattendance', staffAttendanceRouter)
app.use('/api/v1/announcement', announcementRouter)
app.use('/api/v1/withdrawal', withdrawalRouter)
app.use('/api/v1/bursary', bursaryRouter)


const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'UCHEVA_APP API',
        version: '2.0.0',
        description:
            `Ucheva school management API for staff, students, fees, classes, and announcements.
             The base URL is: https://ucheva.onrender.com`,
        license: {
            name: 'Ucheva API',
            url: 'https://ucheva.onrender.com',
        },
        contact: {
            name: 'Ucheva Team',
            url: 'https://ucheva.onrender.com',
        },
    },
    servers: [
        {
            url: 'https://ucheva.onrender.com',
            description: 'production server',
        },
        {
            url: 'http://localhost:6699',
            description: 'local server',
        },
    ],
    security: [
        {
            bearerAuth: []
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    }
};

const options = {
    swaggerDefinition,
    apis: ['./router/*.js']
}

const swaggerSpec = swaggerJsdoc(options);
app.use('/api/v1/admin/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// app.use((error, req, res , next)=>{
//     console.log(error.message)
//     res.status(500).json({
//         message: "something went wrong",  
//         status: error.statusCode
//     })
// })
// 404 handler for undefined routes - must come before error handler
app.use((req, res, next) => {
    res.status(404).json({
        message: `Route ${req.originalUrl} with method ${req.method} not found`,
        status: 404,
        path: req.originalUrl,
        method: req.method
    })
})


app.use((error, req, res, next) => {
    // Log full error details to server console/Render logs
    console.error('Error Details:', {
        error: error,
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Handle specific known errors with user-friendly messages
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'session expired: please login to continue'
        });
    }

    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'invalid token: please login to continue'
        });
    }

    if (error.name === 'MulterError') {
        return res.status(400).json({
            message: 'File upload error'
        });
    }

    // Handle Mongoose/MongoDB errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Invalid data provided'
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            message: 'Invalid ID format'
        });
    }

    if (error.code === 11000) { // MongoDB duplicate key error
        return res.status(409).json({
            message: 'Record already exists'
        });
    }

    if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
        return res.status(500).json({
            message: 'Server error. Please try again later.'
        });
    }

    // Handle third-party service errors (Cloudinary, Email, External APIs)
    // These errors can expose sensitive info like API keys, endpoints, etc.
    if (error.name === 'CloudinaryError' || 
        (error.message && error.message.toLowerCase().includes('cloudinary'))) {
        return res.status(500).json({
            message: 'File upload failed. Please try again.'
        });
    }

    // Handle Axios/HTTP errors from external APIs (Kora, etc.)
    if (error.code === 'ENOTFOUND' || 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.toLowerCase().includes('network') ||
        error.message?.toLowerCase().includes('timeout')) {
        return res.status(500).json({
            message: 'Service temporarily unavailable. Please try again later.'
        });
    }

    // Handle email sending errors
    if (error.message?.toLowerCase().includes('email') ||
        error.message?.toLowerCase().includes('smtp') ||
        error.message?.toLowerCase().includes('brevo')) {
        return res.status(500).json({
            message: 'Failed to send email. Please try again later.'
        });
    }

    // For all other errors, send generic message to client
    // Full error details are only in server logs
    const statusCode = error.statusCode || 500;
    
    // Only expose safe, generic messages to users
    const userMessage = statusCode === 500 
        ? 'Internal server error' 
        : error.message || 'Request failed';

    res.status(statusCode).json({
        message: userMessage,
        status: statusCode
    })
});


mongoose.connect(process.env.MONGO_URI).then(()=>{
    redisClient.connect().then(()=>{
    console.log('redis client connected successfully')
}).catch((err)=>{
    console.log('redis client connection error', err)
})
    console.log('database connected successfully'),
     app.listen(PORT, ()=>{
    console.log('app is listening to port', PORT)
})}).catch((error)=>{console.log(`error connecting to database, ${error.message}`);
})
