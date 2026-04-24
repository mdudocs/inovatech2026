CREATE DATABASE IF NOT EXISTS inovatech_mercurio;
USE inovatech_mercurio;

CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  role ENUM('population', 'doctor', 'collector') NOT NULL,
  login_identifier VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  territory VARCHAR(160) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE communities (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  municipality VARCHAR(120) NOT NULL,
  river_section VARCHAR(80) NOT NULL,
  risk_level ENUM('stable', 'attention', 'critical') NOT NULL DEFAULT 'stable',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_alerts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  community_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  level ENUM('stable', 'attention', 'critical') NOT NULL,
  description TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_health_alerts_community
    FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE TABLE appointments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  appointment_at DATETIME NOT NULL,
  status VARCHAR(60) NOT NULL,
  note TEXT,
  CONSTRAINT fk_appointments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE patient_cases (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_user_id BIGINT UNSIGNED NOT NULL,
  doctor_user_id BIGINT UNSIGNED NULL,
  community_id BIGINT UNSIGNED NOT NULL,
  risk_label VARCHAR(40) NOT NULL,
  case_status VARCHAR(80) NOT NULL,
  next_step TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_patient_cases_patient
    FOREIGN KEY (patient_user_id) REFERENCES users(id),
  CONSTRAINT fk_patient_cases_doctor
    FOREIGN KEY (doctor_user_id) REFERENCES users(id),
  CONSTRAINT fk_patient_cases_community
    FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE TABLE collection_routes (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  collector_user_id BIGINT UNSIGNED NOT NULL,
  stop_name VARCHAR(160) NOT NULL,
  eta VARCHAR(40) NOT NULL,
  focus VARCHAR(180) NOT NULL,
  risk_label VARCHAR(40) NOT NULL,
  route_date DATE NOT NULL,
  CONSTRAINT fk_collection_routes_user
    FOREIGN KEY (collector_user_id) REFERENCES users(id)
);

CREATE TABLE collection_samples (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  collector_user_id BIGINT UNSIGNED NOT NULL,
  community_id BIGINT UNSIGNED NOT NULL,
  sample_type VARCHAR(80) NOT NULL,
  quantity_label VARCHAR(60) NOT NULL,
  notes TEXT,
  collection_window VARCHAR(60),
  status VARCHAR(60) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_collection_samples_user
    FOREIGN KEY (collector_user_id) REFERENCES users(id),
  CONSTRAINT fk_collection_samples_community
    FOREIGN KEY (community_id) REFERENCES communities(id)
);
