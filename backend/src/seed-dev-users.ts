import { prisma } from "./lib/prisma.js";

async function main() {
  const users = [
    // Bronze Users (normal)
    { name: "Bronze User A", email: "bronze1@meta-iitgn.edu", role: "normal", points: 100 },
    { name: "Bronze User B", email: "bronze2@meta-iitgn.edu", role: "normal", points: 200 },
    { name: "Bronze User C", email: "bronze3@meta-iitgn.edu", role: "normal", points: 300 },
    
    // Silver Users (moderator)
    { name: "Silver User A", email: "silver1@meta-iitgn.edu", role: "moderator", points: 500 },
    { name: "Silver User B", email: "silver2@meta-iitgn.edu", role: "moderator", points: 700 },
    { name: "Silver User C", email: "silver3@meta-iitgn.edu", role: "moderator", points: 900 },

    // Gold Users (admin)
    { name: "Gold User A", email: "gold1@meta-iitgn.edu", role: "admin", points: 1500 },
    { name: "Gold User B", email: "gold2@meta-iitgn.edu", role: "admin", points: 2500 },
    { name: "Gold User C", email: "gold3@meta-iitgn.edu", role: "admin", points: 5000 },
  ];

  for (const u of users) {
    await prisma.users.upsert({
      where: { email: u.email },
      update: { role: u.role as any, points: u.points, name: u.name },
      create: {
        name: u.name,
        email: u.email,
        role: u.role as any,
        points: u.points
      }
    });
  }

  console.log("Successfully seeded 9 dev users across all 3 tiers!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
