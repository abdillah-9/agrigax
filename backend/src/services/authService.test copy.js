import { describe, test, expect } from "vitest";
import { login } from "./authService";

describe("login function", () => {

  test("returns success for correct credentials", () => {

    expect(
      login("admin@test.com", "1234")
    ).toBe("Login successful");

  });

});
