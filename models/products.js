const { required, boolean } = require("joi")
const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        min: 1,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        min: 5,
        required: true,
    }, 
    categories: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    stockCount: {
        type: Number,
        required: true,
        min: 0
    }
}, 
{ timestamps: true })

//This is for altering the result shown. The use of virtual edits _id to id
//So when the _id wants to be edited to id, this works

productSchema.virtual("id").get(function (){
    return this._id.toHexString()
})

productSchema.set("toJSON", {
    virtuals: true
})


module.exports = mongoose.model("products", productSchema)