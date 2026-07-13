import { describe, test, expect } from "vitest";
const { signIn, signUp, signOut, userSessionCheck, quickUserSessionCheck, deleteAccountById } = require('./auth');
const jwt = require('jsonwebtoken');
require('dotenv').config();

describe("services_authentication_tests", ()=>{
    //sign_in test
    test("signIn_test",async ()=>{

        //create temp account
        const create_temp_account = await signUp({
            full_name: "Temp User 8",
            phone: "+255700000008",
            email: "temp8@example.com",
            password: "some_hash_here",
            avatar: null,
            active_role: "customer",
            is_verified: false,
            is_suspended: false
        });

        //sign in into fake account
        const result = await signIn({email:"temp8@example.com", password:'some_hash_here'});

        expect(result).toBeDefined();

        //delete temp account
        await deleteAccountById(create_temp_account.id);

    }); 

    //sign_up test
    test("signUp_test", async ()=>{
        const result = await signUp({
    full_name: "Test User",
    phone: "+255700000000",
    email: "test@example.com",
    password: "some_hash_here",
    avatar: null,
    active_role: "customer",
    is_verified: false,
    is_suspended: false
});

    expect(result.id).toBeDefined();
    expect(result.access_token).toBeDefined();

    });

    test("signOut",async ()=>{
        const access_token_hash = jwt.sign({id:17},process.env.ACCESS_SECRET_KEY,{
            expiresIn:"15min",
        });

        const refresh_token_hash = jwt.sign({id:17},process.env.REFRESH_SECRET_KEY,{
            expiresIn:"7d",
        });

        const result = await signOut({access_token_hash,refresh_token_hash});

        expect(result.id).toBeDefined();
    });

    test("userSessionCheck", async ()=>{
        const access_token_hash = jwt.sign({id: 17}, process.env.ACCESS_SECRET_KEY, {
            expiresIn:"15min"
        });

        const refresh_token_hash = jwt.sign({id: 17}, process.env.REFRESH_SECRET_KEY, {
            expiresIn:"7d"
        });
        
        const request = await userSessionCheck({access_token_hash, refresh_token_hash});
        expect(request.id).toBeDefined();
        expect(request.access_token_hash).toBeDefined();
        expect(request.refresh_token_hash).toBeDefined();
    });

    test("quickUserSessionCheck", async()=>{
        const access_token_hash = jwt.sign({id: 17}, process.env.ACCESS_SECRET_KEY, {
            expiresIn:"15min"
        });

        const result = await quickUserSessionCheck({access_token_hash});

        expect(result.id).toBeDefined();
    })
});

// Quick Debugging Rule

// When you see an error, ask:

// Does it start with:
// AssertionError

// ➡️ Test failed.

// SyntaxError

// ➡️ JavaScript couldn't read the file.

// ReferenceError

// ➡️ Missing variable/function.

// TypeError

// ➡️ Wrong type (null, undefined, etc.).

// Error: Something...

// ➡️ Your application intentionally threw an exception.