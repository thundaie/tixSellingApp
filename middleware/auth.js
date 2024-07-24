const expressJwt = require("express-jwt")
require("dotenv").config()

function authJwt(){
    const secret = process.env.JWT_SECRET

    return expressJwt({
        secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked //TO check for admin
    }).unless({
        path: [
            {url: "", methods: ["GET", "OPTIONS"]}
        ]
    })
}


const isRevoked = async(req, payload, done) => {
    if(!payload.isAdmin){
        done(null, true)
    }
    done()
}


module.exports = authJwt