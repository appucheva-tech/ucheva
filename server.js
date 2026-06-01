const express = require('express');
require('dotenv').config()
require('./config/config')
const sequelize = require('./database/database');
const PORT = 6699
const app = express()

const adminRouter = require('./router/adminRouter')

app.use(express.json())
app.use('/api/admin', adminRouter)








app.use((error, req, res , next)=>{
    res.status(500).json({
        message: error.message, 
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