const categorySchema = require("../models/category")
const router = require("express").Router()



router.get("/", (req, res) => {
    const productCategory = categorySchema.find()

    if(!productCategory){
        res.send({
            success: "failed"
        })
    }
    res.send(productCategory)
})

router.post("/", async(req, res) => {
    const { name, icon, color } = req.body

    let newCategory =  new categorySchema({
        name: name, 
        icon: icon,
        color: color
    })

    if(!newCategory){
        res.send({
            success: false
        })
    }

    await newCategory.save()
    res.status(200).send({
        success: true
    })
})


router.delete("/:id", async(req, res) => {
    const id = req.params.id

    if(!id){
        res.status(404).send({
            message: "A valid id param must be provided"
        })
    }
    try {
        let deletedCategory = await categorySchema.findByIdAndDelete(id)
        if(!deletedCategory){
            res.send({
                status: false,
                message: "Invalid ID"
            })
        }
        res.send({
            status: true
        })
    } catch (error) {
        console.log(error)
        res.send({
            status: error
        })
    }
})


router.get("/:id", async(req, res) => {
    const id = req.params.id

    if(!id){
        res.status(404).send({
            message: "A valid id param must be provided"
        })
    }

    try {
        let oneCategory = await categorySchema.findById(id)

        if(!oneCategory){
            res.send({
                status: false
            })
            res.send({
                status: true
            })
        }
    } catch (error) {
        console.log(error)
        res.send({
            status: error
        })
    }
})


router.put("/", async(req, res) => {

    const id = req.params.id
    const { name, icon, color } = req.body

    let updatedCategories = categorySchema.findByIdAndUpdate(
        id,
        {
            name: name,
            icon: icon,
            color: color
        }, 
        {
            new: save
        }
    )

    if(!updatedCategories){
        res.send({
            success: false
        })
    }

    await updatedCategories.save()
    res.status(200).send({
        success: true
    })
})