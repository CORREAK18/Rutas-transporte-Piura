import { createCoordinate } from "@/models/coordinate";

export function toMapCoordinate(value) {
  if (!value) {
    return createCoordinate(0, 0);
  }

  return createCoordinate(
    value.latitude ?? value.lat ?? 0,
    value.longitude ?? value.lng ?? 0,
  );
}

export function getBoundingRegion(coordinates = []) {
  if (!coordinates.length) {
    return {
      latitude: -5.1945,
      longitude: -80.6328,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }

  const latitudes = coordinates.map((point) => Number(point.latitude));
  const longitudes = coordinates.map((point) => Number(point.longitude));

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.max((maxLat - minLat) * 1.6, 0.01);
  const longitudeDelta = Math.max((maxLng - minLng) * 1.6, 0.01);

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
}
