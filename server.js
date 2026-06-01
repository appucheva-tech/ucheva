const express = require('express');
require('dotenv').config()
require('./config/config')
const sequelize = require('./database/database');
const PORT = 6699
const app = express()


const staffRouter = require('./router/staffRouter') 
const studentRouter = require('./router/studentRouter')
const adminRouter = require('./router/adminRouter')

app.use(express.json())
app.use('/api/v1/staff',staffRouter)
app.use('/api/v1/student',studentRouter)
app.use('/api/v1/admin', adminRouter)

app.use((error, req, res , next)=>{
    console.log(error.message)
    res.status(500).json({
        message: 'something went wrong',  
        status: error.statusCode
    })
})

const database = async()=>{
    await sequelize.authenticate().then(()=>{
    app.listen(PORT, ()=>{
    console.log(`server listening to port, ${PORT}`)
})

console.log(`database connected successfully`)
    }).catch((error)=>{'unable to connect to database', error.message})
}

database()
