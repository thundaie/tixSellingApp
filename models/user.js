const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        min: 5,
        required: true,
        unique: true
    },
    email: {
        type: String,
        min: 5,
        required: true,
        unique: true
    },
    password: {
        type: String,
        min: 5,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true })

userSchema.virtual("id").get(function () {
    return this._id.toHexString()
})

userSchema.set("toJSON", {
    virtuals: true
})

userSchema.pre("save", async function(next){
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.comparePassword = async function(password){
    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model("users", userSchema)