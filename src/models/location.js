import { normalizeCoordinate } from "./coordinate";

export function createLocation(input) {
  const coordinate = normalizeCoordinate(input?.coordinate ?? input);

  return {
    ...coordinate,
    accuracy: Number(input?.accuracy ?? 0),
    heading: Number(input?.heading ?? 0),
    timestamp: input?.timestamp ?? null,
  };
}
