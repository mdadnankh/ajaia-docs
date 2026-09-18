import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "../lib/password";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_USERS = [
  {
    email: "alex@ajaia.dev",
    name: "Alex Rivera",
    password: "demo123",
  },
  {
    email: "jordan@ajaia.dev",
    name: "Jordan Lee",
    password: "demo123",
  },
];

async function main() {
  for (const person of DEMO_USERS) {
    const passwordHash = hashPassword(person.password);
    await prisma.user.upsert({
      where: { email: person.email },
      update: { name: person.name, passwordHash },
      create: {
        email: person.email,
        name: person.name,
        passwordHash,
      },
    });
  }

  const alex = await prisma.user.findUniqueOrThrow({
    where: { email: "alex@ajaia.dev" },
  });
  const jordan = await prisma.user.findUniqueOrThrow({
    where: { email: "jordan@ajaia.dev" },
  });

  const existing = await prisma.document.findFirst({
    where: { ownerId: alex.id, title: "Welcome to Ajaia Docs" },
  });

  if (!existing) {
    const doc = await prisma.document.create({
      data: {
        title: "Welcome to Ajaia Docs",
        ownerId: alex.id,
        content: `<h1>Shared starter note</h1><p>This document is owned by <strong>Alex</strong> and already shared with <em>Jordan</em>.</p><ul><li>Create a document</li><li>Import a .txt or .md file</li><li>Share it with the other seeded user</li></ul>`,
      },
    });
    await prisma.share.create({
      data: { documentId: doc.id, userId: jordan.id },
    });
  }

  console.log("Seeded users: alex@ajaia.dev / demo123 and jordan@ajaia.dev / demo123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
