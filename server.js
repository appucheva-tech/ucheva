const express = require('express');
require('dotenv').config()
require('./config/config')
const sequelize = require('./database/database');
const PORT = 6699
const app = express()

const userRouter = require('./router/userRouter')
const staffRouter = require('./router/staffRouter') 
const studentRouter = require('./router/studentRouter')

app.use(express.json())
app.use(userRouter)
app.use(staffRouter)
app.use(studentRouter)






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
