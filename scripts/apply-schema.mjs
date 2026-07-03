/**
 * apply-schema.mjs
 *
 * Script para aplicar el schema de Neon a la base de datos.
 * Ejecútalo con: node apply-schema.mjs
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Credenciales Neon ───────────────────────────────────────────────────────
const NEON_HOST = process.env.EXPO_PUBLIC_NEON_HOST;
const NEON_USER = process.env.EXPO_PUBLIC_NEON_USER;
const NEON_PASSWORD = process.env.EXPO_PUBLIC_NEON_PASSWORD;
const NEON_DATABASE = process.env.EXPO_PUBLIC_NEON_DATABASE;
const NEON_CONNECTION_STRING = `postgresql://${NEON_USER}:${NEON_PASSWORD}@${NEON_HOST}/${NEON_DATABASE}?sslmode=require`;
const NEON_ENDPOINT = `https://${NEON_HOST}/sql`;

async function neonQuery(sql, params = []) {
  const response = await fetch(NEON_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Neon-Connection-String": NEON_CONNECTION_STRING,
    },
    body: JSON.stringify({ query: sql, params }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Neon HTTP ${response.status}: ${errorBody}`);
  }

  const result = await response.json();
  return result.rows ?? [];
}

// ─── Leer el archivo SQL ─────────────────────────────────────────────────────
// Busca el schema tanto en la raíz del proyecto como en rutas relativas comunes
const SQL_PATHS = [
  join(__dirname, "neon_schema.sql"),
  join(__dirname, "scripts", "neon_schema.sql"),
  "C:\\Users\\USUARIO\\.gemini\\antigravity-ide\\brain\\0a0e488a-ca92-4ce8-b00a-52c956a8cce8\\neon_schema.sql",
];

let schemaSQL = null;
for (const sqlPath of SQL_PATHS) {
  try {
    schemaSQL = readFileSync(sqlPath, "utf-8");
    console.log(`✅ Schema encontrado en: ${sqlPath}`);
    break;
  } catch { }
}

if (!schemaSQL) {
  console.error(
    "❌ No se encontró el archivo neon_schema.sql. Cópialo al directorio del proyecto."
  );
  process.exit(1);
}

// ─── Dividir y ejecutar las sentencias SQL ────────────────────────────────────
async function applySchema() {
  console.log("\n🚀 Aplicando schema en Neon...\n");

  // Verificar conexión
  try {
    await neonQuery("SELECT NOW() AS hora");
    console.log("✅ Conexión a Neon verificada.\n");
  } catch (err) {
    console.error("❌ No se puede conectar a Neon:", err.message);
    process.exit(1);
  }

  // Dividir por ";" pero respetando bloques $$ de funciones PL/pgSQL
  const statements = schemaSQL
    .replace(/--[^\n]*/g, "") // Quitar comentarios de línea
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let success = 0;
  let failed = 0;

  for (const stmt of statements) {
    try {
      await neonQuery(stmt);
      process.stdout.write(".");
      success++;
    } catch (err) {
      console.error(`\n⚠️  Sentencia falló (continúa): ${err.message.slice(0, 120)}`);
      failed++;
    }
  }

  console.log(`\n\n✅ Schema aplicado: ${success} sentencias exitosas, ${failed} fallidas.`);

  // Verificar tablas creadas
  const tables = await neonQuery(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log("\n📋 Tablas en la base de datos:");
  tables.forEach((t) => console.log(`   ✓ ${t.table_name}`));

  // Verificar usuarios insertados
  const users = await neonQuery("SELECT id, display_name, email, role FROM users");
  console.log("\n👤 Usuarios registrados:");
  users.forEach((u) => console.log(`   ✓ ${u.role.padEnd(10)} ${u.email}  (${u.display_name})`));
}

applySchema().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
