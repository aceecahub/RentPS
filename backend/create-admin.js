import { auth } from "./config/auth.js";
import prisma from "./prisma/client.js";

async function createAdmin() {
  try {
    const user = await auth.api.signUpEmail({
      body: {
        name: "Admin RentPS",
        email: "admin@gmail.com",
        password: "password123",
      }
    });
    
    if (user) {
      // Update role to ADMIN directly in the database
      await prisma.user.update({
        where: { email: "admin@gmail.com" },
        data: { role: "ADMIN" }
      });
      console.log("Admin account created successfully!");
      console.log("Email: admin@gmail.com");
      console.log("Password: password123");
      console.log("Role: ADMIN");
    }
  } catch (e) {
    console.error("Error creating admin:", e);
  }
}

createAdmin();
