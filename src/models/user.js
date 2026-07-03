export function createUser(input) {
  return {
    id: String(input.id),
    displayName: String(input.displayName ?? "Usuario"),
    email: String(input.email ?? ""),
    favoriteRouteIds: Array.isArray(input.favoriteRouteIds)
      ? input.favoriteRouteIds.map(String)
      : [],
  };
}
