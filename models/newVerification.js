const mongoose = require("mongoose")

const newVerificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    uniqueString: {
        type: String,
        required: true
    },
    createdAt: Date,
    expiresIn: Date
})

module.exports = mongoose.model("userVerification", newVerificationSchema)
