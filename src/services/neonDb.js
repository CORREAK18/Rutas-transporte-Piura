const NEON_HOST = process.env.EXPO_PUBLIC_NEON_HOST;
const NEON_DATABASE = process.env.EXPO_PUBLIC_NEON_DATABASE;
const NEON_USER = process.env.EXPO_PUBLIC_NEON_USER;
const NEON_PASSWORD = process.env.EXPO_PUBLIC_NEON_PASSWORD;

const NEON_CONNECTION_STRING = `postgresql://${NEON_USER}:${NEON_PASSWORD}@${NEON_HOST}/${NEON_DATABASE}?sslmode=require`;
const NEON_ENDPOINT = `https://${NEON_HOST}/sql`;

export async function query(sql, params = []) {
  try {
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
  } catch (error) {
    console.error("[neonDb] Error al ejecutar query:", error.message);
    throw error;
  }
}

export async function testConnection() {
  try {
    await query("SELECT 1 AS ok");
    return true;
  } catch {
    return false;
  }
}
