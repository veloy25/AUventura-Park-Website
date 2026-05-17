-- Contato Service Schema
CREATE DATABASE IF NOT EXISTS auventura;
USE auventura;

CREATE TABLE IF NOT EXISTS contatos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  telefone VARCHAR(20) DEFAULT NULL,
  assunto VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON contatos(email);
CREATE INDEX idx_criado_em ON contatos(criado_em);