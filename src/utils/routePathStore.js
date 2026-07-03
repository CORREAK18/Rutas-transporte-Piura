/**
 * Store temporal en memoria para comunicar el resultado del trazado de ruta
 * y paraderos desde la pantalla del mapa interactivo de vuelta al formulario de creación.
 */

let _pendingPath = null;
let _pendingStops = null;

export function setPendingPath(coordinates) {
  _pendingPath = coordinates;
}

export function consumePendingPath() {
  const path = _pendingPath;
  _pendingPath = null;
  return path;
}

export function hasPendingPath() {
  return _pendingPath !== null;
}

export function setPendingStops(stops) {
  _pendingStops = stops;
}

export function consumePendingStops() {
  const stops = _pendingStops;
  _pendingStops = null;
  return stops;
}

export function hasPendingStops() {
  return _pendingStops !== null;
}

export function getPendingPath() {
  return _pendingPath;
}

export function getPendingStops() {
  return _pendingStops;
}
