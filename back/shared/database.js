require("dotenv").config();
const mysql = require("mysql2");

const DB_HOST     = process.env.DB_HOST     || "127.0.0.1";
const DB_USER     = process.env.DB_USER     || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME     = process.env.DB_DATABASE || "auventura";
const DB_PORT     = process.env.DB_PORT     || 3306;

const rootPool = mysql.createPool({
  host: DB_HOST, user: DB_USER, password: DB_PASSWORD, port: DB_PORT,
  waitForConnections: true, connectionLimit: 2, queueLimit: 0,
});

const pool = mysql.createPool({
  host: DB_HOST, user: DB_USER, password: DB_PASSWORD,
  database: DB_NAME, port: DB_PORT,
  waitForConnections: true, connectionLimit: 10, queueLimit: 0,
  dateStrings: true,
}).promise();

const ensureDatabase = async () => {
  await rootPool.promise().query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
};

const initializeDatabase = async () => {
  console.log("Initializing database...");
  await ensureDatabase();
  console.log("Database ensured.");

  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log("Database table 'users' is ready.");

  await pool.query(`CREATE TABLE IF NOT EXISTS depoimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomeCachorro VARCHAR(100) NOT NULL,
    nomeTutor VARCHAR(100) NOT NULL,
    raca VARCHAR(100) NOT NULL,
    comentario TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log("Database table 'depoimentos' is ready.");

  await pool.query(`CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nomeCachorro VARCHAR(100) NOT NULL,
    servico VARCHAR(150) NOT NULL,
    \`data\` DATE NOT NULL,
    horario VARCHAR(50) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  console.log("Database table 'agendamentos' is ready.");

  await pool.query(`CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    idade INT NOT NULL,
    peso DECIMAL(5,2) NOT NULL,
    raca VARCHAR(100) NOT NULL,
    vacinas VARCHAR(255) DEFAULT '',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  console.log("Database table 'pets' is ready.");

  await pool.query(`CREATE TABLE IF NOT EXISTS daycare_agendamentos (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    pet_id       INT NOT NULL,
    plano        VARCHAR(20) NOT NULL,
    frequencia   VARCHAR(30),
    dias_semana  JSON,
    data_inicio  DATE,
    data_avulso  DATE,
    datas_geradas JSON NOT NULL,
    valor_total  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    observacoes  TEXT,
    status       VARCHAR(20) NOT NULL DEFAULT 'pendente',
    criado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  console.log("Database table 'daycare_agendamentos' is ready.");

    await pool.query(`CREATE TABLE IF NOT EXISTS contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(180) NOT NULL,
    telefone VARCHAR(30),
    assunto VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'novo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log("Database table 'contatos' is ready.");
};

module.exports = { pool, ensureDatabase, initializeDatabase };