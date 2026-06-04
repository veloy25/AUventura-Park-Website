-- Notificacoes Service Schema
CREATE DATABASE IF NOT EXISTS auventura;

USE auventura;

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
CREATE INDEX idx_notificacoes_user ON notificacoes (user_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes (lida);