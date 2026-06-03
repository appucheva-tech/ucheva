const express = require('express');
require('dotenv').config()
require('./config/config')

const sequelize = require('./database/database');
const redis = require('./config/redis')
const PORT = 6699
const app = express()

const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
const cors = require('cors')

const staffRouter = require('./router/staffRouter') 
const studentRouter = require('./router/studentRouter')
const adminRouter = require('./router/adminRouter')
const classRouter = require('./router/classRouter')

app.use(cors())
app.use(express.json())
app.use('/api/v1/staff',staffRouter)
app.use('/api/v1/student',studentRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/class', classRouter)


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
            description: 'development server',
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

const database = async()=>{
    await sequelize.authenticate().then(()=>{
    redis.connect().then(()=>{
    console.log('redis client connected successfully')
}).catch((err)=>{
    console.log('redis client connection error', err)
})
    console.log(`database connected successfully`)

    app.listen(PORT, ()=>{
    console.log(`server listening to port, ${PORT}`)
})
    }).catch((error)=>{'unable to connect to database', error.message})
}

database();