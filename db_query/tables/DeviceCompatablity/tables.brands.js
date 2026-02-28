import db from "../../../config/db.js";

async function createDeviceCompatibilityTables() {
  try {

    const brandsTable = `
      CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const deviceFamiliesTable = `
      CREATE TABLE IF NOT EXISTS device_families (
        id INT AUTO_INCREMENT PRIMARY KEY,
        brand_id INT NOT NULL,
        family_name VARCHAR(150) NOT NULL,
        esim_supported BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (brand_id) REFERENCES brands(id)
          ON DELETE CASCADE
      );
    `;

    const deviceVariantsTable = `
      CREATE TABLE IF NOT EXISTS device_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        family_id INT NOT NULL,
        model_code VARCHAR(100) NOT NULL,
        match_type ENUM('exact','prefix') DEFAULT 'exact',
        os ENUM('Android','iOS') NOT NULL,
        min_os_version DECIMAL(4,1) DEFAULT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES device_families(id)
          ON DELETE CASCADE,
        INDEX idx_model_code (model_code),
        INDEX idx_os_version (os, min_os_version),
        INDEX idx_match_type (match_type)
      );
    `;

    const compatibilityRulesTable = `
      CREATE TABLE IF NOT EXISTS compatibility_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        variant_id INT NOT NULL,
        country_code VARCHAR(5) DEFAULT NULL,
        esim_enabled BOOLEAN DEFAULT TRUE,
        effective_from DATE DEFAULT NULL,
        effective_to DATE DEFAULT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (variant_id) REFERENCES device_variants(id)
          ON DELETE CASCADE,
        INDEX idx_country (country_code),
        INDEX idx_variant (variant_id)
      );
    `;

    const detectionLogsTable = `
      CREATE TABLE IF NOT EXISTS detection_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_agent TEXT NOT NULL,
        detected_model VARCHAR(150),
        detected_os VARCHAR(50),
        compatible BOOLEAN,
        confidence ENUM('high','medium','low'),
        detection_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_detected_model (detected_model),
        INDEX idx_created_at (created_at)
      );
    `;

    // Execute in correct order (respect FK dependencies)
    await db.query(brandsTable);
    await db.query(deviceFamiliesTable);
    await db.query(deviceVariantsTable);
    await db.query(compatibilityRulesTable);
    await db.query(detectionLogsTable);

    console.log(" Device compatibility tables created successfully.");

  } catch (error) {
    console.error(" Error creating device compatibility tables:", error);
  }
}

createDeviceCompatibilityTables();