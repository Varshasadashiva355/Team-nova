-- Paste into phpMyAdmin > SQL tab > Go
CREATE DATABASE IF NOT EXISTS visionmate;
USE visionmate;

CREATE TABLE IF NOT EXISTS detections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('object','text','obstacle') NOT NULL,
  result TEXT NOT NULL,
  confidence DECIMAL(5,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO detections (type, result, confidence) VALUES
('object','chair',91.20),('object','person',97.50),
('text','EXIT',NULL),('text','ROOM 204',NULL),
('obstacle','chair very close ahead',88.00);

INSERT INTO saved_places (name, note) VALUES
('Washroom','2nd floor, left of the lift'),
('Library','Ground floor, main entrance');
