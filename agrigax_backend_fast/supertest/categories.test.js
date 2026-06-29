const request = require("supertest");
const app = require("../src/index");

await request(app).post("").send({});