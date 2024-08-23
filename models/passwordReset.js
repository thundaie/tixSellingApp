const mongoose = require("mongoose")

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    resetString: {
        type: String,
        required: true
    },
    createdAt: Date,
    expiresIn: Date
})

module.exports = mongoose.model("PasswordReset", passwordResetSchema)
