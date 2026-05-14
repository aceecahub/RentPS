import { auth } from "./config/auth.js";
async function test() {
  try {
    const user = await auth.api.signUpEmail({
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      }
    });
    console.log("Success:", user);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
