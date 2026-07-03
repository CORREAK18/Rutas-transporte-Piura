export function createFavorite(input) {
  return {
    userId: String(input.userId),
    routeId: String(input.routeId),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}
