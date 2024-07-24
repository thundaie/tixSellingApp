const mongoose = require("mongoose")
require("dotenv").config()


async function connectDb(){
        mongoose.connect(process.env.CONNECTION_URI)
   
        mongoose.connection.on("connected", () => {
            console.log("Database connection has been established")
        })

        mongoose.connection.on("error", (error) => {
            console.log(error)
        })
        
}

module.exports = connectDb