const express = require('express');
require('dotenv').config()
require('./config/config')
require('./models/association')

const sequelize = require('./database/database');
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
const announcement =require('./router/announcementRouter')
const securityRouter = require('./router/securityRouter')
const feeRouter = require('./router/feeRouter')
const classTeacherRouter = require('./router/classTeacherRouter')
const paymentRouter = require('./router/paymentRouter')
const staffAttendanceRouter = require('./router/staffAttendanceRouter')

app.use(cors())
app.use(express.json())
app.use('/api/v1/staff',staffRouter)
app.use('/api/v1/student',studentRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/class', classRouter)
app.use('/api/v1/classteacher', classTeacherRouter)
app.use('/api/v1/subject', subjectRouter)
app.use('/api/v1/announcement',announcement )
app.use('/api/v1/security', securityRouter)
app.use('/api/v1/fee', feeRouter)
app.use('/api/v1/payment', paymentRouter)
app.use('/api/v1/staffattendance', staffAttendanceRouter)


const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'UCHEVA_APP API',
        version: '2.0.0',
        description: 
            `This is a REST API application made with Express. It retrieves data from JSONPlaceholder.
             The base URL is: https://ucheva.onrender.com`,
        license: {
            name: 'Official URL',
            url: 'https://google.com',
        },
        contact: {
            name: 'JSONPlaceholder',
            url: 'https://jsonplaceholder.typicode.com',
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

app.use((error, req, res , next)=>{
    console.log(error.message)
    res.status(500).json({
        message: error.message,  
        status: error.statusCode
    })
})

const database = async () => {
    try {
        await sequelize.authenticate();
        console.log('database connected successfully');

        await redis.connect();
        console.log('redis client connected successfully');

        app.listen(PORT, () => {
            console.log(`server listening to port, ${PORT}`);
        });
    } catch (error) {
        console.log('Connection error:', error.message);
    }
};

database();
