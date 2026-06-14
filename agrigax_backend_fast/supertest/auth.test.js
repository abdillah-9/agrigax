const express = require("express");
const app = require('../src/index');
const request = require("supertest");
import "vitest";
import { describe, expect, test } from "vitest";

describe("supertest auth tests",()=>{
    test("sign-in_test",async ()=>{

        //include supertest
        const result = await request(app).post("/auth/sign-in").send({email:"test@example.com", password:'some_hash_here'});

        //use expect from vitest
        expect(result.status).toBe(200);

        // expect(result.headers["set-cookie"]).toHaveLength(2);
        console.log("result is : ************************************** "+ JSON.stringify(result));
    });
});

