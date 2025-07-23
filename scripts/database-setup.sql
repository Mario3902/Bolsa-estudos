-- Create database if not exists
CREATE DATABASE IF NOT EXISTS bolsadee_bolsa_estudos;
USE bolsadee_bolsa_estudos;

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    data_nascimento DATE NOT NULL,
    genero ENUM('masculino', 'feminino', 'outro') NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    endereco TEXT NOT NULL,
    nivel_escolaridade VARCHAR(100) NOT NULL,
    instituicao_ensino VARCHAR(255) NOT NULL,
    curso VARCHAR(255) NOT NULL,
    ano_conclusao YEAR NOT NULL,
    media DECIMAL(4,2) NOT NULL,
    carta_motivacao TEXT NOT NULL,
    objetivos_carreira TEXT NOT NULL,
    status ENUM('pendente', 'aprovada', 'rejeitada') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    duration_months INT NOT NULL,
    requirements TEXT,
    deadline DATE NOT NULL,
    status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO admin_users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9S/EG', 'admin');

-- Insert sample scholarship
INSERT IGNORE INTO scholarships (name, description, amount, duration_months, requirements, deadline) 
VALUES (
    'Bolsa de Estudos Universitária',
    'Bolsa para estudantes universitários com excelente desempenho acadêmico',
    5000.00,
    12,
    'Média mínima de 16 valores, carta de motivação, comprovativo de matrícula',
    '2024-12-31'
);
