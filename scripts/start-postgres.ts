import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const databaseDir = resolve(root, "data/postgres");

mkdirSync(databaseDir, { recursive: true });

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "ajaia",
  password: "ajaia",
  port: 5432,
  persistent: true,
});

async function main() {
  try {
    await pg.initialise();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/already exists|initdb|cluster/i.test(message)) {
      throw error;
    }
  }

  await pg.start();

  try {
    await pg.createDatabase("ajaia_docs");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/already exists/i.test(message)) {
      throw error;
    }
  }

  console.log("PostgreSQL is running at postgresql://ajaia:ajaia@localhost:5432/ajaia_docs");
  console.log("Keep this process open while you use the app.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
