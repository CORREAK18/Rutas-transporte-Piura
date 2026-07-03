export function createReport(input) {
  return {
    id: String(input.id),
    userId: String(input.userId),
    routeId: String(input.routeId),
    type: String(input.type),
    description: String(input.description ?? ""),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}
