import prisma from "./prisma/client.js";

async function fix() {
  const users = await prisma.user.findMany({
    where: { password: { not: null } }
  });
  console.log(`Found ${users.length} users with passwords.`);

  for (const user of users) {
    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" }
    });

    if (!existingAccount) {
      await prisma.account.create({
        data: {
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: user.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log(`Created credential account for ${user.email}`);
    } else {
      console.log(`Account already exists for ${user.email}`);
    }
  }
  console.log("Done fixing old users.");
}
fix();
