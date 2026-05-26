import { describe,test,expect } from "vitest";
const { getUserByEmail } = require("./authRepo");

describe("Testing authentication repository",()=>{
    
    test("testing getUserByEmail",async()=>{
        expect({email: "test@gmail.com"}).toBeDefined();
    });

    test("updateRefreshToken",()=>{
        expect({id, refreshToken});
    });

    test("createUser",()=>{
        expect({email:"test@gmail.com",password:"12345678",role:"customer"}).toBeDefined;
    });

    test("insertRefreshToken",()=>{
        expect({id, refreshToken})
    });

    test("userSignOut",()=>{
        expect({userId})
    });

    test("getRefreshTokenByUserId",()=>{
        expect({userId})
    });
})