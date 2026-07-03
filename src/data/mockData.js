import { createFavorite } from "@/models/favorite";
import { createReport } from "@/models/report";
import { createRoute } from "@/models/route";
import { createStop } from "@/models/stop";
import { createUser } from "@/models/user";
import { createVehicle } from "@/models/vehicle";

export const DEMO_USER_ID = "user-demo";

export const mockStops = [
  createStop({
    id: "stop-01",
    routeIds: ["route-01"],
    name: "Terminal Terrestre",
    code: "P-001",
    order: 1,
    coordinate: { latitude: -5.1945, longitude: -80.6328 },
    reference: "Punto inicial principal",
  }),
  createStop({
    id: "stop-02",
    routeIds: ["route-01", "route-02"],
    name: "Mercado Modelo",
    code: "P-002",
    order: 2,
    coordinate: { latitude: -5.195, longitude: -80.6304 },
    reference: "Zona comercial central",
  }),
  createStop({
    id: "stop-03",
    routeIds: ["route-01"],
    name: "Plaza de Armas",
    code: "P-003",
    order: 3,
    coordinate: { latitude: -5.1959, longitude: -80.6278 },
    reference: "Centro histórico",
  }),
  createStop({
    id: "stop-04",
    routeIds: ["route-01", "route-03"],
    name: "Centro Cívico",
    code: "P-004",
    order: 4,
    coordinate: { latitude: -5.1969, longitude: -80.6253 },
    reference: "Eje administrativo",
  }),
  createStop({
    id: "stop-05",
    routeIds: ["route-02"],
    name: "Universidad Nacional",
    code: "P-005",
    order: 1,
    coordinate: { latitude: -5.1878, longitude: -80.6248 },
    reference: "Campus principal",
  }),
  createStop({
    id: "stop-06",
    routeIds: ["route-02", "route-03"],
    name: "Hospital Regional",
    code: "P-006",
    order: 3,
    coordinate: { latitude: -5.1914, longitude: -80.6297 },
    reference: "Zona de salud",
  }),
  createStop({
    id: "stop-07",
    routeIds: ["route-02"],
    name: "Av. Grau",
    code: "P-007",
    order: 4,
    coordinate: { latitude: -5.1938, longitude: -80.6322 },
    reference: "Corredor principal",
  }),
  createStop({
    id: "stop-08",
    routeIds: ["route-03"],
    name: "Villa Universitaria",
    code: "P-008",
    order: 5,
    coordinate: { latitude: -5.1984, longitude: -80.6354 },
    reference: "Zona residencial",
  }),
];

export const mockRoutes = [
  createRoute({
    id: "route-01",
    code: "R-01",
    name: "Terminal a Centro",
    shortName: "Terminal - Centro",
    description:
      "Conecta el terminal terrestre con el centro histórico y el mercado.",
    fare: 1.5,
    distanceKm: 5.8,
    estimatedMinutes: 26,
    featuredRank: 1,
    color: "#f97316",
    keywords: ["terminal", "centro", "mercado", "plaza"],
    tags: ["trazado principal", "alta demanda"],
    origin: {
      label: "Terminal Terrestre",
      coordinate: { latitude: -5.1945, longitude: -80.6328 },
    },
    destination: {
      label: "Centro Cívico",
      coordinate: { latitude: -5.1969, longitude: -80.6253 },
    },
    stopIds: ["stop-01", "stop-02", "stop-03", "stop-04"],
    pathCoordinates: [
      { latitude: -5.1945, longitude: -80.6328 },
      { latitude: -5.1949, longitude: -80.6312 },
      { latitude: -5.1952, longitude: -80.6297 },
      { latitude: -5.1957, longitude: -80.6281 },
      { latitude: -5.1963, longitude: -80.6264 },
      { latitude: -5.1969, longitude: -80.6253 },
    ],
  }),
  createRoute({
    id: "route-02",
    code: "R-02",
    name: "Universidad a Hospital",
    shortName: "Universidad - Hospital",
    description:
      "Ruta rápida entre la universidad, el mercado y el hospital regional.",
    fare: 1.8,
    distanceKm: 7.1,
    estimatedMinutes: 31,
    featuredRank: 2,
    color: "#5eead4",
    keywords: ["universidad", "hospital", "mercado", "grau"],
    tags: ["conexión estudiantil", "servicio frecuente"],
    origin: {
      label: "Universidad Nacional",
      coordinate: { latitude: -5.1878, longitude: -80.6248 },
    },
    destination: {
      label: "Hospital Regional",
      coordinate: { latitude: -5.1914, longitude: -80.6297 },
    },
    stopIds: ["stop-05", "stop-02", "stop-06", "stop-07"],
    pathCoordinates: [
      { latitude: -5.1878, longitude: -80.6248 },
      { latitude: -5.1891, longitude: -80.6263 },
      { latitude: -5.1907, longitude: -80.6278 },
      { latitude: -5.1914, longitude: -80.6297 },
      { latitude: -5.1926, longitude: -80.6311 },
      { latitude: -5.1938, longitude: -80.6322 },
    ],
  }),
  createRoute({
    id: "route-03",
    code: "R-03",
    name: "Villa Universitaria a Mercado",
    shortName: "Villa - Mercado",
    description:
      "Recorrido barrial que une la villa universitaria con el mercado y el centro.",
    fare: 1.6,
    distanceKm: 6.4,
    estimatedMinutes: 29,
    featuredRank: 3,
    color: "#38bdf8",
    keywords: ["villa universitaria", "mercado", "centro", "hospital"],
    tags: ["barrial", "paraderos intermedios"],
    origin: {
      label: "Villa Universitaria",
      coordinate: { latitude: -5.1984, longitude: -80.6354 },
    },
    destination: {
      label: "Mercado Modelo",
      coordinate: { latitude: -5.195, longitude: -80.6304 },
    },
    stopIds: ["stop-08", "stop-06", "stop-04", "stop-02"],
    pathCoordinates: [
      { latitude: -5.1984, longitude: -80.6354 },
      { latitude: -5.1973, longitude: -80.6341 },
      { latitude: -5.1964, longitude: -80.6326 },
      { latitude: -5.1959, longitude: -80.6311 },
      { latitude: -5.1954, longitude: -80.6301 },
      { latitude: -5.195, longitude: -80.6304 },
    ],
  }),
];

export const mockUsers = [
  createUser({
    id: DEMO_USER_ID,
    displayName: "Usuario Demo",
    email: "demo@rutastransporte.pe",
    favoriteRouteIds: ["route-01"],
  }),
];

export let mockFavorites = [
  createFavorite({ userId: DEMO_USER_ID, routeId: "route-01" }),
];

export const mockVehicles = [
  createVehicle({
    id: "vehicle-01",
    routeId: "route-01",
    code: "C-12",
    plate: "P-1023",
    status: "activo",
    heading: 82,
    location: { latitude: -5.1955, longitude: -80.6291, accuracy: 12 },
  }),
  createVehicle({
    id: "vehicle-02",
    routeId: "route-02",
    code: "C-31",
    plate: "P-2044",
    status: "activo",
    heading: 138,
    location: { latitude: -5.1909, longitude: -80.6289, accuracy: 11 },
  }),
];

export const mockReports = [
  createReport({
    id: "report-01",
    userId: DEMO_USER_ID,
    routeId: "route-02",
    type: "demora",
    description: "La unidad tarda más de lo habitual en hora punta.",
  }),
  createReport({
    id: "report-02",
    userId: DEMO_USER_ID,
    routeId: "route-03",
    type: "capacidad",
    description: "Solicitan más frecuencia en tramo barrial.",
  }),
];

export function toggleMockFavoriteRoute(userId, routeId) {
  const targetUserId = String(userId);
  const targetRouteId = String(routeId);
  const existingIndex = mockFavorites.findIndex(
    (favorite) =>
      favorite.userId === targetUserId && favorite.routeId === targetRouteId,
  );

  if (existingIndex >= 0) {
    mockFavorites = mockFavorites.filter(
      (favorite, index) => index !== existingIndex,
    );
    return { isFavorite: false };
  }

  mockFavorites = [
    ...mockFavorites,
    createFavorite({ userId: targetUserId, routeId: targetRouteId }),
  ];

  return { isFavorite: true };
}
