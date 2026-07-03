export function createCoordinate(latitude, longitude) {
  return {
    latitude: Number(latitude),
    longitude: Number(longitude),
  };
}

export function normalizeCoordinate(value) {
  if (!value) {
    return createCoordinate(0, 0);
  }

  if (
    typeof value.latitude !== "undefined" &&
    typeof value.longitude !== "undefined"
  ) {
    return createCoordinate(value.latitude, value.longitude);
  }

  if (typeof value.lat !== "undefined" && typeof value.lng !== "undefined") {
    return createCoordinate(value.lat, value.lng);
  }

  return createCoordinate(0, 0);
}
