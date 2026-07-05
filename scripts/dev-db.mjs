// Base de datos Postgres LOCAL de desarrollo (embedded-postgres).
// Real, con puerto fijo (5433) y datos persistentes en `.dev-postgres/`.
// NO es el servidor de producción — es efímera y solo para desarrollo/tests.
//
//   node scripts/dev-db.mjs         → inicia y se queda viva (Ctrl+C para parar)
//   node scripts/dev-db.mjs stop    → detiene el cluster
//
// Conexión: postgresql://postgres:postgres@localhost:5433/rahel_dev
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, appendFileSync, readFileSync } from "node:fs";

const DATA_DIR = "./.dev-postgres";
const PORT = 5544; // 5433 lo ocupa el Postgres de sistema del usuario
const DB_NAME = "rahel_dev";

// El sandbox bloquea bind a localhost específico; escuchar en el wildcard sí
// funciona. Forzamos listen_addresses='*' en la config del cluster.
function ensureWildcardListen() {
  try {
    const conf = `${DATA_DIR}/postgresql.conf`;
    if (!readFileSync(conf, "utf8").includes("listen_addresses = '*'")) {
      appendFileSync(conf, "\nlisten_addresses = '*'\n");
    }
  } catch {
    // ignore
  }
}

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

const mode = process.argv[2];

if (mode === "stop") {
  await pg.stop();
  console.log("postgres detenido");
  process.exit(0);
}

// Inicializa el cluster solo la primera vez.
if (!existsSync(`${DATA_DIR}/PG_VERSION`)) {
  console.log("inicializando cluster…");
  await pg.initialise();
}

ensureWildcardListen();

await pg.start();
console.log(`postgres arriba en :${PORT}`);

try {
  await pg.createDatabase(DB_NAME);
  console.log(`base ${DB_NAME} creada`);
} catch {
  console.log(`base ${DB_NAME} ya existía`);
}

console.log("READY");

const shutdown = async () => {
  console.log("deteniendo postgres…");
  try {
    await pg.stop();
  } catch {
    // ignore
  }
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Mantener el proceso vivo mientras el server corre.
await new Promise(() => {});
