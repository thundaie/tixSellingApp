const User = require("../models/user")
const jwt = require("jsonwebtoken")
require("dotenv").config()

async function authenticate(req, res, next){
    const token = res.cookie["token"]

    if(!token){
        res.json({
            message: "You have to be signed In to access this route"
        })
    }

    const verify = jwt.verify(token, process.env.JWT_SECRET)

    try {
        const user = await User.findOne({ username: verify.user })

        if(!user){
            res.json({
                message: "You have to be signed In to access this route"
            })
            next()
        }
    } catch (error) {
        res.status(401).json({
            message: "You have to be signed In to access this route"
        })
    }
}


module.exports = authenticate