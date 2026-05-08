-- Daycare Service Tables
CREATE TABLE IF NOT EXISTS daycare_agendamentos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  pet_id       INT NOT NULL,
  plano        VARCHAR(20) NOT NULL,         -- dayuse | mensal | trimestral | semestral | anual
  frequencia   VARCHAR(30),                  -- Ex: "3x por semana"
  dias_semana  JSON,                         -- Ex: [1,3,5]
  data_inicio  DATE,                         -- Para planos recorrentes
  data_avulso  DATE,                         -- Apenas para dayuse
  datas_geradas JSON NOT NULL,               -- Todas as datas expandidas do plano
  valor_total  DECIMAL(10,2) NOT NULL,
  observacoes  TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'pendente',
  criado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pet_id)  REFERENCES pets(id)
);

CREATE INDEX idx_daycare_user   ON daycare_agendamentos (user_id);
CREATE INDEX idx_daycare_pet    ON daycare_agendamentos (pet_id);
CREATE INDEX idx_daycare_status ON daycare_agendamentos (status);