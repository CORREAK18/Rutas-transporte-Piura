/**
 * localDb.js
 *
 * Capa de datos híbrida:
 *  - Rutas y paraderos → Neon (PostgreSQL en la nube, compartido entre usuarios)
 *  - Favoritos         → AsyncStorage local del dispositivo (preferencia personal)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { query } from "./neonDb";

const KEYS = {
  FAVORITES: "@rutas_transporte_favorites",
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES DE MAPEO (DB → Modelo JS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convierte una fila de la tabla `routes` en el objeto de modelo JS.
 */
function rowToRoute(row) {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    shortName: String(row.short_name ?? row.name),
    description: String(row.description ?? ""),
    fare: Number(row.fare ?? 0),
    distanceKm: Number(row.distance_km ?? 0),
    estimatedMinutes: Number(row.estimated_minutes ?? 0),
    featuredRank: Number(row.featured_rank ?? 99),
    color: String(row.color ?? "#00f5d4"),
    keywords: row.keywords ? String(row.keywords).split(",").map((k) => k.trim()).filter(Boolean) : [],
    tags: row.tags ? String(row.tags).split(",").map((t) => t.trim()).filter(Boolean) : [],
    origin: {
      label: String(row.origin_label ?? ""),
      coordinate: {
        latitude: Number(row.origin_lat ?? 0),
        longitude: Number(row.origin_lng ?? 0),
      },
    },
    destination: {
      label: String(row.destination_label ?? ""),
      coordinate: {
        latitude: Number(row.destination_lat ?? 0),
        longitude: Number(row.destination_lng ?? 0),
      },
    },
    pathCoordinates: Array.isArray(row.path_coordinates)
      ? row.path_coordinates
      : (typeof row.path_coordinates === "string"
          ? JSON.parse(row.path_coordinates)
          : []),
    stopIds: [],
  };
}

/**
 * Convierte una fila de la tabla `stops` + `route_stops` en el objeto de modelo JS.
 */
function rowToStop(row) {
  return {
    id: String(row.id),
    routeIds: row.route_ids
      ? String(row.route_ids).split(",").map((r) => r.trim()).filter(Boolean)
      : [],
    name: String(row.name),
    code: String(row.code ?? ""),
    order: Number(row.stop_order ?? 0),
    coordinate: {
      latitude: Number(row.latitude ?? 0),
      longitude: Number(row.longitude ?? 0),
    },
    reference: String(row.reference ?? ""),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERACIONES DE RUTAS (NEON)
// ─────────────────────────────────────────────────────────────────────────────

export async function getRoutes() {
  try {
    const rows = await query(`
      SELECT * FROM routes
      ORDER BY featured_rank ASC, name ASC
    `);
    return rows.map(rowToRoute);
  } catch (error) {
    console.error("[localDb] Error al obtener rutas de Neon:", error.message);
    return [];
  }
}

export async function getRouteById(routeId) {
  try {
    const rows = await query(
      "SELECT * FROM routes WHERE id = $1 LIMIT 1",
      [String(routeId)]
    );
    return rows.length > 0 ? rowToRoute(rows[0]) : null;
  } catch (error) {
    console.error("[localDb] Error al obtener ruta por ID:", error.message);
    return null;
  }
}

/**
 * Guarda (INSERT o UPDATE) una ruta en Neon.
 */
export async function saveRoute(routeData) {
  try {
    // 1. Limpiar paraderos asociados previamente a esta ruta para evitar duplicados/obsoletos
    await query("DELETE FROM route_stops WHERE route_id = $1", [String(routeData.id)]);

    const keywordsStr = Array.isArray(routeData.keywords)
      ? routeData.keywords.join(",")
      : "";
    const tagsStr = Array.isArray(routeData.tags)
      ? routeData.tags.join(",")
      : "";
    const pathJson = JSON.stringify(routeData.pathCoordinates ?? []);

    await query(
      `INSERT INTO routes (
        id, code, name, short_name, description,
        fare, distance_km, estimated_minutes, featured_rank, color,
        keywords, tags,
        origin_label, origin_lat, origin_lng,
        destination_label, destination_lat, destination_lng,
        path_coordinates, created_by
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12,
        $13, $14, $15,
        $16, $17, $18,
        $19::jsonb, $20
      )
      ON CONFLICT (id) DO UPDATE SET
        code              = EXCLUDED.code,
        name              = EXCLUDED.name,
        short_name        = EXCLUDED.short_name,
        description       = EXCLUDED.description,
        fare              = EXCLUDED.fare,
        distance_km       = EXCLUDED.distance_km,
        estimated_minutes = EXCLUDED.estimated_minutes,
        featured_rank     = EXCLUDED.featured_rank,
        color             = EXCLUDED.color,
        keywords          = EXCLUDED.keywords,
        tags              = EXCLUDED.tags,
        origin_label      = EXCLUDED.origin_label,
        origin_lat        = EXCLUDED.origin_lat,
        origin_lng        = EXCLUDED.origin_lng,
        destination_label = EXCLUDED.destination_label,
        destination_lat   = EXCLUDED.destination_lat,
        destination_lng   = EXCLUDED.destination_lng,
        path_coordinates  = EXCLUDED.path_coordinates`,
      [
        String(routeData.id),
        String(routeData.code),
        String(routeData.name),
        String(routeData.shortName ?? routeData.name),
        String(routeData.description ?? ""),
        Number(routeData.fare ?? 0),
        Number(routeData.distanceKm ?? 0),
        Number(routeData.estimatedMinutes ?? 0),
        Number(routeData.featuredRank ?? 99),
        String(routeData.color ?? "#00f5d4"),
        keywordsStr,
        tagsStr,
        String(routeData.origin?.label ?? ""),
        Number(routeData.origin?.coordinate?.latitude ?? 0),
        Number(routeData.origin?.coordinate?.longitude ?? 0),
        String(routeData.destination?.label ?? ""),
        Number(routeData.destination?.coordinate?.latitude ?? 0),
        Number(routeData.destination?.coordinate?.longitude ?? 0),
        pathJson,
        String(routeData.createdBy ?? "usr-admin"),
      ]
    );
    return routeData;
  } catch (error) {
    console.error("[localDb] Error al guardar ruta en Neon:", error.message);
    throw error;
  }
}

/**
 * Elimina una ruta de Neon y limpia sus paraderos huérfanos.
 */
export async function deleteRoute(routeId) {
  try {
    // 1. Eliminar la ruta (route_stops se borrará en cascada)
    await query("DELETE FROM routes WHERE id = $1", [String(routeId)]);

    // 2. Opcional: Eliminar paraderos huérfanos que no pertenezcan a ninguna ruta activa
    await query(`
      DELETE FROM stops
      WHERE id NOT IN (SELECT DISTINCT stop_id FROM route_stops)
    `);

    return true;
  } catch (error) {
    console.error("[localDb] Error al eliminar ruta en Neon:", error.message);
    throw error;
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// OPERACIONES DE PARADEROS (NEON)
// ─────────────────────────────────────────────────────────────────────────────

export async function getStops() {
  try {
    // Obtiene todos los paraderos con los route_ids agrupados
    const rows = await query(`
      SELECT
        s.*,
        STRING_AGG(rs.route_id, ',') AS route_ids,
        MIN(rs.stop_order)           AS stop_order
      FROM stops s
      LEFT JOIN route_stops rs ON rs.stop_id = s.id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    return rows.map(rowToStop);
  } catch (error) {
    console.error("[localDb] Error al obtener paraderos de Neon:", error.message);
    return [];
  }
}

export async function getStopsByRouteId(routeId) {
  try {
    const rows = await query(
      `SELECT
        s.*,
        $1                AS route_ids,
        rs.stop_order     AS stop_order
      FROM stops s
      INNER JOIN route_stops rs ON rs.stop_id = s.id AND rs.route_id = $1
      ORDER BY rs.stop_order ASC`,
      [String(routeId)]
    );
    return rows.map(rowToStop);
  } catch (error) {
    console.error("[localDb] Error al obtener paraderos por ruta:", error.message);
    return [];
  }
}

/**
 * Guarda un array de paraderos y los vincula a las rutas en route_stops.
 */
export async function saveStops(stopsArray) {
  try {
    for (const stop of stopsArray) {
      const lat = Number(stop.coordinate?.latitude ?? 0);
      const lng = Number(stop.coordinate?.longitude ?? 0);

      // Upsert paradero en tabla stops
      await query(
        `INSERT INTO stops (id, code, name, reference, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name      = EXCLUDED.name,
           code      = EXCLUDED.code,
           reference = EXCLUDED.reference,
           latitude  = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude`,
        [
          String(stop.id),
          String(stop.code ?? ""),
          String(stop.name),
          String(stop.reference ?? ""),
          lat,
          lng,
        ]
      );

      // Vincular paradero a las rutas (route_stops)
      const routeIds = Array.isArray(stop.routeIds) ? stop.routeIds : [];
      for (const routeId of routeIds) {
        await query(
          `INSERT INTO route_stops (route_id, stop_id, stop_order)
           VALUES ($1, $2, $3)
           ON CONFLICT (route_id, stop_id) DO UPDATE SET
             stop_order = EXCLUDED.stop_order`,
          [String(routeId), String(stop.id), Number(stop.order ?? 0)]
        );
      }
    }
    return true;
  } catch (error) {
    console.error("[localDb] Error al guardar paraderos en Neon:", error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERACIONES DE FAVORITOS (AsyncStorage LOCAL — preferencia personal)
// ─────────────────────────────────────────────────────────────────────────────

export async function getFavoriteRouteIds(userId) {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAVORITES);
    if (!data) return [];
    const favorites = JSON.parse(data);
    const userIdStr = String(userId);
    return favorites
      .filter((fav) => String(fav.userId) === userIdStr)
      .map((fav) => String(fav.routeId));
  } catch (error) {
    console.error("[localDb] Error al obtener IDs de favoritos:", error);
    return [];
  }
}

export async function getFavoriteRoutes(userId) {
  try {
    const favIds = await getFavoriteRouteIds(userId);
    if (!favIds.length) return [];
    const routes = await getRoutes();
    return routes.filter((r) => favIds.includes(String(r.id)));
  } catch (error) {
    console.error("[localDb] Error al obtener rutas favoritas:", error);
    return [];
  }
}

export async function toggleFavorite(userId, routeId) {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAVORITES);
    let favorites = data ? JSON.parse(data) : [];
    const userIdStr = String(userId);
    const routeIdStr = String(routeId);

    const existingIndex = favorites.findIndex(
      (fav) =>
        String(fav.userId) === userIdStr && String(fav.routeId) === routeIdStr
    );

    let isFavorite = false;
    if (existingIndex >= 0) {
      favorites = favorites.filter((_, i) => i !== existingIndex);
    } else {
      favorites.push({ userId: userIdStr, routeId: routeIdStr });
      isFavorite = true;
    }

    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    return { isFavorite };
  } catch (error) {
    console.error("[localDb] Error al alternar favorito:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// initDb: compatibilidad con código existente (no hace nada, Neon no requiere seed)
// ─────────────────────────────────────────────────────────────────────────────
export async function initDb() {
  // Ya no necesitamos inicializar datos locales.
  // Las rutas y paraderos viven en Neon.
  // Esta función se mantiene para no romper el código que la llama.
  return true;
}
