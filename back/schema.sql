-- AUventura Database Schema Reference
-- This is a reference file showing the complete database structure.
-- Each microservice maintains its own schema file:
-- - services/user-service/schema.sql (users table)
-- - services/depoimentos-service/schema.sql (depoimentos table)
-- - services/agendamentos-service/schema.sql (agendamentos table)
-- - services/daycare-service/schema.sql (daycare_agendamentos table)
-- - services/contato-service/schema.sql (contatos table)
-- - services/notificacoes-service/index.js (notificacoes table - sem schema.sql dedicado)


CREATE DATABASE IF NOT EXISTS auventura;


USE auventura;


-- User Service Tables
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Depoimentos Service Tables
CREATE TABLE IF NOT EXISTS depoimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomeCachorro VARCHAR(100) NOT NULL,
    nomeTutor VARCHAR(100) NOT NULL,
    raca VARCHAR(100) NOT NULL,
    comentario TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Agendamento Service Tables
CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nomeCachorro VARCHAR(100) NOT NULL,
    servico VARCHAR(150) NOT NULL,
    `data` DATE NOT NULL,
    horario VARCHAR(50) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);


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


-- Daycare Service Tables
CREATE TABLE IF NOT EXISTS daycare_agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pet_id INT NOT NULL,
    plano VARCHAR(20) NOT NULL,         -- dayuse | mensal | trimestral | semestral | anual
    frequencia VARCHAR(30),             -- Ex: "3x por semana"
    dias_semana JSON,                   -- Ex: [1,3,5]
    data_inicio DATE,                   -- Para planos recorrentes
    data_avulso DATE,                   -- Apenas para dayuse
    datas_geradas JSON NOT NULL,        -- Todas as datas expandidas do plano
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);


-- Contato Service Tables
CREATE TABLE IF NOT EXISTS contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) DEFAULT NULL,
    assunto VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Notificacoes Service Tables
CREATE TABLE IF NOT EXISTS notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,          -- agendamento | daycare | geral
    lida TINYINT(1) NOT NULL DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);


-- Indexes for better query performance
CREATE INDEX idx_email ON users (email);

CREATE INDEX idx_criado_em ON depoimentos (criado_em);

CREATE INDEX idx_agendamentos_user ON agendamentos (user_id);

CREATE INDEX idx_pets_user ON pets (user_id);

CREATE INDEX idx_daycare_user ON daycare_agendamentos (user_id);
CREATE INDEX idx_daycare_pet ON daycare_agendamentos (pet_id);
CREATE INDEX idx_daycare_status ON daycare_agendamentos (status);

CREATE INDEX idx_contatos_email ON contatos (email);
CREATE INDEX idx_contatos_criado_em ON contatos (criado_em);

CREATE INDEX idx_notificacoes_user ON notificacoes (user_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes (lida);