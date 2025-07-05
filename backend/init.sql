-- Script d'initialisation pour Rate Em All
-- Ce script est exécuté automatiquement quand le conteneur PostgreSQL démarre

-- Création de la base de données (si elle n'existe pas déjà)
SELECT 'CREATE DATABASE rate_em_all'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rate_em_all')\gexec

-- Connexion à la base de données
\c rate_em_all;

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Message de confirmation
SELECT 'Base de données rate_em_all initialisée avec succès!' as message;
