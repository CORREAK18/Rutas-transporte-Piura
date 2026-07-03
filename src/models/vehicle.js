import { createLocation } from "./location";

export function createVehicle(input) {
  return {
    id: String(input.id),
    routeId: String(input.routeId),
    code: String(input.code ?? ""),
    plate: String(input.plate ?? ""),
    status: String(input.status ?? "activo"),
    heading: Number(input.heading ?? 0),
    location: createLocation(input.location ?? {}),
  };
}
