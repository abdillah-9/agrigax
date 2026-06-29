const request = require("supertest");
import {describe,test, expect} from "vitest";
import app from "../src";

describe("categories testing", ()=>{
    test("createCategory_supertest", async()=>{
        const data = {name:'', slug:'slug_'+Date.now(), description: `description_${Date.now()}`}
        const result = await request(app).post("/categories").send(data);

        console.log(result);
        expect(result.body.result).toBeDefined();
    });

    test("selectAllCategory_supertest", async()=>{
        const result = await request(app).get("/categories");

        console.log(result);

        expect(result.status).toBe(200);
    });
});