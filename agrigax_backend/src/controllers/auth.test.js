import { describe, expect, test } from "vitest";
import { signIn } from "./auth";

describe("controllers_authentication_tests", ()=>{
    test("controller signIn test",()=>{
        const req = {email:"test@example.com", password:'some_hash_here'};
        const res = {message:"You have successfully signed-In", id: 17};
        const result = signIn(req, res, next);

        expect(result.res.message).toBeDefined();
    });
})