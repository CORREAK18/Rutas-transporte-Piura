export const ROUTES = {
  home: () => "/",
  search: () => "/buscar-ruta",
  results: () => "/resultados",
  favorites: () => "/favoritos",
  createRoute: () => "/crear-ruta",
  createRouteMap: () => "/crear-ruta-mapa",
  routeDetail: (routeId) => `/ruta/${routeId}`,
  routeMap: (routeId) => `/mapa/${routeId}`,
};
