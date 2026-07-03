import { normalizeCoordinate } from "./coordinate";

export function createRoute(input) {
  const coordinates = Array.isArray(input.pathCoordinates)
    ? input.pathCoordinates.map(normalizeCoordinate)
    : [];

  return {
    id: String(input.id),
    code: String(input.code),
    name: String(input.name),
    shortName: String(input.shortName ?? input.name),
    description: String(input.description ?? ""),
    fare: Number(input.fare ?? 0),
    distanceKm: Number(input.distanceKm ?? 0),
    estimatedMinutes: Number(input.estimatedMinutes ?? 0),
    featuredRank: Number(input.featuredRank ?? 99),
    color: String(input.color ?? "#5eead4"),
    keywords: Array.isArray(input.keywords) ? input.keywords.map(String) : [],
    tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
    origin: {
      label: String(input.origin?.label ?? ""),
      coordinate: normalizeCoordinate(input.origin?.coordinate),
    },
    destination: {
      label: String(input.destination?.label ?? ""),
      coordinate: normalizeCoordinate(input.destination?.coordinate),
    },
    stopIds: Array.isArray(input.stopIds) ? input.stopIds.map(String) : [],
    pathCoordinates: coordinates,
  };
}
