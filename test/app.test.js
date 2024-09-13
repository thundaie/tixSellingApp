const jest = require("jest")
const app = require("../app")
const { request } = require("supertest")


describe("test user signUp", () => {
    test("To return status code 200 when it successfully logs in", async() => {
        const response = await request(app).post("/user/signIn").send({
            username: "username",
            password: "password"
        })

        expect(response.statusCode).toBe(200)
    })

    test("To throw a message if fields arent inputed", async() => {
        const response = await request(app).post("/user/signIn").send({
            username: "",
            password: ""
        })
        expect(response).toBe("Please fill in all required fields")
    })
})