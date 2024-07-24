const qrCode = require("qrcode")
const router = require("express").Router()


router.get("/", (req, res) => {
    const bodyPayload = req.body

    qrCode.toDataURL(bodyPayload, (err, data) => {
        if(err){
            console.log(err)
            res.json({
                message: "An internal server error occured"
            })
        }
    res.json({
        message: data
    })
    })
})


module.exports = router