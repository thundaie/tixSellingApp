const router = require("express").Router()
const https = require('https')
require("dotenv").config()

const testKey = process.env.TEST_SECRET_KEY

app.get("/paystack", (req, res) => {
   
const params = JSON.stringify({
  "email": req.body.email,
  "amount": req.body.amount
})

const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/transaction/initialize',
  method: 'POST',
  headers: {
    Authorization: `Bearer ${testKey}`,
    'Content-Type': 'application/json'
  }
}

const reqPaystack = https.request(options, resPaystack => {
  let data = ''

  resPaystack.on('data', (chunk) => {
    data += chunk
  });

  resPaystack.on('end', () => {
    console.log(JSON.parse(data))
  })
}).on('error', error => {
  console.error(error)
})

reqPaystack.write(params)
reqPaystack.end()
})