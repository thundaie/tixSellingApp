const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    orderItem: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "orderItem",
        required: true
    }],
    address: {
        type: String
    },
    phoneNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
}, 
{ timestamps: true })

orderSchema.virtual("id").get(function () {
    return this._id.toHexString()
})

orderSchema.set("toJSON", {
    virtuals: true
})



module.exports = mongoose.model("orders", orderSchema)