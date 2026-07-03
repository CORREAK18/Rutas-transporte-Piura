import { normalizeCoordinate } from "./coordinate";

export function createStop(input) {
  return {
    id: String(input.id),
    routeIds: Array.isArray(input.routeIds) ? input.routeIds.map(String) : [],
    name: String(input.name),
    code: String(input.code ?? ""),
    order: Number(input.order ?? 0),
    coordinate: normalizeCoordinate(input.coordinate),
    reference: String(input.reference ?? ""),
  };
}
