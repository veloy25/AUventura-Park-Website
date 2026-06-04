-- Pets Service Schema
CREATE DATABASE IF NOT EXISTS auventura;

USE auventura;

-- Pets Service Tables
CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    idade INT NOT NULL,
    peso DECIMAL(5, 2) NOT NULL,
    raca VARCHAR(100) NOT NULL,
    vacinas VARCHAR(255) DEFAULT '',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Indexes for better query performance
CREATE INDEX idx_pets_user ON pets (user_id);