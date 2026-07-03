-- =============================================
-- RUTAS PIURA — Schema simple para Neon (prototipo)
-- Tablas: users, routes, stops, route_stops
-- Favoritos: se guardan local en AsyncStorage (no en BD)
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Borrar tablas si ya existen (para re-ejecutar limpio)
DROP TABLE IF EXISTS route_stops     CASCADE;
DROP TABLE IF EXISTS stops           CASCADE;
DROP TABLE IF EXISTS routes          CASCADE;
DROP TABLE IF EXISTS users           CASCADE;


-- =============================================
-- TABLA: users
-- =============================================
CREATE TABLE users (
  id            TEXT        PRIMARY KEY,
  display_name  TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password      TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'visitante', -- 'admin' | 'usuario' | 'visitante'
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: routes
-- =============================================
CREATE TABLE routes (
  id                  TEXT            PRIMARY KEY,
  code                TEXT            NOT NULL UNIQUE,
  name                TEXT            NOT NULL,
  short_name          TEXT            NOT NULL,
  description         TEXT            DEFAULT '',
  fare                DECIMAL(6,2)    DEFAULT 0,
  distance_km         DECIMAL(7,3)    DEFAULT 0,
  estimated_minutes   INTEGER         DEFAULT 0,
  featured_rank       INTEGER         DEFAULT 99,
  color               TEXT            DEFAULT '#5eead4',
  keywords            TEXT            DEFAULT '',   -- separados por coma
  tags                TEXT            DEFAULT '',   -- separados por coma
  origin_label        TEXT            DEFAULT '',
  origin_lat          DOUBLE PRECISION DEFAULT 0,
  origin_lng          DOUBLE PRECISION DEFAULT 0,
  destination_label   TEXT            DEFAULT '',
  destination_lat     DOUBLE PRECISION DEFAULT 0,
  destination_lng     DOUBLE PRECISION DEFAULT 0,
  path_coordinates    JSONB           DEFAULT '[]', -- [{latitude, longitude}, ...]
  created_by          TEXT            REFERENCES users(id),
  created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: stops (paraderos)
-- =============================================
CREATE TABLE stops (
  id          TEXT              PRIMARY KEY,
  code        TEXT              DEFAULT '',
  name        TEXT              NOT NULL,
  reference   TEXT              DEFAULT '',
  latitude    DOUBLE PRECISION  DEFAULT 0,
  longitude   DOUBLE PRECISION  DEFAULT 0,
  created_at  TIMESTAMP         NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: route_stops (qué paraderos tiene cada ruta y en qué orden)
-- =============================================
CREATE TABLE route_stops (
  route_id    TEXT     NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  stop_id     TEXT     NOT NULL REFERENCES stops(id)  ON DELETE CASCADE,
  stop_order  INTEGER  DEFAULT 0,
  PRIMARY KEY (route_id, stop_id)
);


-- =============================================
-- DATOS DE PRUEBA: Usuarios
-- Las contraseñas se hashean con bcrypt (blowfish, costo 10)
-- crypt('contraseña', gen_salt('bf', 10)) → hash seguro de una sola vía
-- =============================================
INSERT INTO users (id, display_name, email, password, role) VALUES
  ('usr-admin',
   'Administrador',
   'admin@rutas.pe',
   crypt('admin123', gen_salt('bf', 10)),
   'admin'),

  ('usr-usuario',
   'Juan Pérez',
   'usuario@rutas.pe',
   crypt('usuario123', gen_salt('bf', 10)),
   'usuario'),

  ('usr-guest',
   'Visitante Demo',
   'visitante@rutas.pe',
   crypt('guest123', gen_salt('bf', 10)),
   'visitante');

-- =============================================
-- CÓMO VERIFICAR UNA CONTRASEÑA DESDE SQL:
-- SELECT * FROM users
--   WHERE email = 'admin@rutas.pe'
--   AND password = crypt('admin123', password);
-- =============================================
