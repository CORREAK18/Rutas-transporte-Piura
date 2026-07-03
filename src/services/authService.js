import AsyncStorage from "@react-native-async-storage/async-storage";
import { query } from "./neonDb";

const SESSION_KEY = "@rutas_transporte_session";

export async function login(email, password) {
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPass = String(password).trim();

  try {
    const rows = await query(
      `SELECT id, display_name, email, role
       FROM users
       WHERE email = $1
         AND password = crypt($2, password)
       LIMIT 1`,
      [cleanEmail, cleanPass]
    );

    if (!rows || rows.length === 0) {
      throw new Error("Credenciales inválidas. Intente de nuevo.");
    }

    const dbUser = rows[0];
    const user = {
      id: String(dbUser.id),
      email: String(dbUser.email),
      displayName: String(dbUser.display_name),
      role: String(dbUser.role),
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    if (error.message.includes("Credenciales inválidas")) {
      throw error;
    }
    console.error("[authService] Error en login:", error.message);
    throw new Error("Error de conexión. Verifica tu internet e intenta nuevamente.");
  }
}

export async function register(displayName, email, password) {
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPass = String(password).trim();
  const cleanName = String(displayName).trim();

  try {
    const existing = await query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [cleanEmail]
    );

    if (existing && existing.length > 0) {
      throw new Error("Este correo ya está registrado. Inicia sesión o usa otro correo.");
    }

    const rows = await query(
      `INSERT INTO users (id, display_name, email, password, role)
       VALUES (gen_random_uuid()::TEXT, $1, $2, crypt($3, gen_salt('bf', 10)), 'usuario')
       RETURNING id, display_name, email, role`,
      [cleanName, cleanEmail, cleanPass]
    );

    if (!rows || rows.length === 0) {
      throw new Error("No se pudo crear la cuenta. Inténtalo nuevamente.");
    }

    const dbUser = rows[0];
    const user = {
      id: String(dbUser.id),
      email: String(dbUser.email),
      displayName: String(dbUser.display_name),
      role: String(dbUser.role),
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    if (
      error.message.includes("ya está registrado") ||
      error.message.includes("No se pudo crear")
    ) {
      throw error;
    }
    console.error("[authService] Error en registro:", error.message);
    throw new Error("Error de conexión al registrar. Verifica tu internet e intenta nuevamente.");
  }
}

export async function loginAsGuest() {
  const guestUser = {
    id: "usr-guest",
    email: "visitante@rutas.pe",
    displayName: "Visitante",
    role: "visitante",
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(guestUser));
  return guestUser;
}

export async function logout() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getCurrentUser() {
  try {
    const data = await AsyncStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function isLoggedIn() {
  const user = await getCurrentUser();
  return user !== null;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
