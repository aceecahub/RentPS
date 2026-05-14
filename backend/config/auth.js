import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../prisma/client.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mysql",
        modelNames: {
            user: "User",
            session: "Session",
            account: "Account",
            verification: "Verification"
        }
    }),
    baseURL: process.env.BETTER_AUTH_URL + "/api/auth",
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://observing-unsliced-congrats.ngrok-free.dev"
    ],
    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password) => {
                const bcrypt = await import("bcrypt");
                return bcrypt.hash(password, 10);
            },
            verify: async ({ hash, password }) => {
                const bcrypt = await import("bcrypt");
                return bcrypt.compare(password, hash);
            }
        }
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "CUSTOMER",
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },

});