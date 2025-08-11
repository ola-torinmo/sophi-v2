// import { loadEnv, defineConfig } from '@medusajs/framework/utils'

// loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// module.exports = defineConfig({
//   projectConfig: {
//     databaseUrl: process.env.DATABASE_URL,
//     http: {
//       storeCors: process.env.STORE_CORS!,
//       adminCors: process.env.ADMIN_CORS!,
//       authCors: process.env.AUTH_CORS!,
//       jwtSecret: process.env.JWT_SECRET || "supersecret",
//       cookieSecret: process.env.COOKIE_SECRET || "supersecret",
//     },
//     databaseDriverOptions: {

//       ssl: false,

//       sslmode: "disable",

//     },
//   }
// })


import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { Client } from 'pg'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Function to create missing tables with Nigerian data
async function ensureTablesExist() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('🔄 Checking database tables...')

    const createTablesSQL = `
      -- Currency table
      CREATE TABLE IF NOT EXISTS currency (
        code VARCHAR(3) PRIMARY KEY,
        symbol VARCHAR(10),
        symbol_native VARCHAR(10),
        name VARCHAR(255),
        includes_tax BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      );

      -- Tax Provider table
      CREATE TABLE IF NOT EXISTS tax_provider (
        id VARCHAR(255) PRIMARY KEY,
        is_installed BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      );

      -- Region table
      CREATE TABLE IF NOT EXISTS region (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        currency_code VARCHAR(3),
        tax_rate DECIMAL(5,2) DEFAULT 0,
        tax_code VARCHAR(255),
        gift_cards_taxable BOOLEAN DEFAULT true,
        automatic_taxes BOOLEAN DEFAULT true,
        tax_provider_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      );

      -- Region Country table
      CREATE TABLE IF NOT EXISTS region_country (
        id VARCHAR(255) PRIMARY KEY,
        iso_2 VARCHAR(2) NOT NULL,
        iso_3 VARCHAR(3),
        num_code INTEGER,
        name VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        region_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      );

      -- Insert default tax provider
      INSERT INTO tax_provider (id) VALUES ('tp_system') ON CONFLICT (id) DO NOTHING;

      -- Insert currencies including Nigerian Naira and others
      INSERT INTO currency (code, symbol, symbol_native, name) VALUES 
        ('ngn', '₦', '₦', 'Nigerian Naira'),
        ('usd', '$', '$', 'US Dollar'),
        ('eur', '€', '€', 'Euro'),
        ('gbp', '£', '£', 'British Pound Sterling'),
        ('cad', 'CA$', '$', 'Canadian Dollar'),
        ('aud', 'A$', '$', 'Australian Dollar'),
        ('jpy', '¥', '¥', 'Japanese Yen'),
        ('chf', 'CHF', 'CHF', 'Swiss Franc'),
        ('cny', '¥', '¥', 'Chinese Yuan'),
        ('inr', '₹', '₹', 'Indian Rupee'),
        ('brl', 'R$', 'R$', 'Brazilian Real'),
        ('krw', '₩', '₩', 'South Korean Won'),
        ('mxn', '$', '$', 'Mexican Peso'),
        ('zar', 'R', 'R', 'South African Rand'),
        ('ghs', '₵', '₵', 'Ghanaian Cedi'),
        ('xof', 'CFA', 'CFA', 'West African CFA Franc'),
        ('xaf', 'FCFA', 'FCFA', 'Central African CFA Franc'),
        ('kes', 'KSh', 'KSh', 'Kenyan Shilling'),
        ('ugx', 'USh', 'USh', 'Ugandan Shilling'),
        ('tzs', 'TSh', 'TSh', 'Tanzanian Shilling')
      ON CONFLICT (code) DO NOTHING;

      -- Insert Nigeria region
      INSERT INTO region (id, name, currency_code, tax_provider_id, tax_rate) 
      VALUES ('reg_nigeria', 'Nigeria', 'ngn', 'tp_system', 7.50) 
      ON CONFLICT (id) DO NOTHING;

      -- Insert default USD region
      INSERT INTO region (id, name, currency_code, tax_provider_id) 
      VALUES ('reg_default', 'International', 'usd', 'tp_system') 
      ON CONFLICT (id) DO NOTHING;

      -- Insert West Africa region
      INSERT INTO region (id, name, currency_code, tax_provider_id) 
      VALUES ('reg_west_africa', 'West Africa', 'xof', 'tp_system') 
      ON CONFLICT (id) DO NOTHING;

      -- Insert Nigerian states and other countries
      INSERT INTO region_country (id, iso_2, iso_3, num_code, name, display_name, region_id) VALUES
        ('country_ng', 'ng', 'nga', 566, 'Nigeria', 'Nigeria', 'reg_nigeria'),
        ('country_gh', 'gh', 'gha', 288, 'Ghana', 'Ghana', 'reg_west_africa'),
        ('country_sn', 'sn', 'sen', 686, 'Senegal', 'Senegal', 'reg_west_africa'),
        ('country_ci', 'ci', 'civ', 384, 'Côte d''Ivoire', 'Ivory Coast', 'reg_west_africa'),
        ('country_ml', 'ml', 'mli', 466, 'Mali', 'Mali', 'reg_west_africa'),
        ('country_bf', 'bf', 'bfa', 854, 'Burkina Faso', 'Burkina Faso', 'reg_west_africa'),
        ('country_us', 'us', 'usa', 840, 'United States', 'United States', 'reg_default'),
        ('country_gb', 'gb', 'gbr', 826, 'United Kingdom', 'United Kingdom', 'reg_default'),
        ('country_ca', 'ca', 'can', 124, 'Canada', 'Canada', 'reg_default'),
        ('country_ke', 'ke', 'ken', 404, 'Kenya', 'Kenya', 'reg_default'),
        ('country_za', 'za', 'zaf', 710, 'South Africa', 'South Africa', 'reg_default'),
        ('country_ug', 'ug', 'uga', 800, 'Uganda', 'Uganda', 'reg_default'),
        ('country_tz', 'tz', 'tza', 834, 'Tanzania', 'Tanzania', 'reg_default')
      ON CONFLICT (id) DO NOTHING;
    `;

    await client.query(createTablesSQL)
    console.log('✅ Database tables ensured with Nigerian data')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
  } finally {
    await client.end()
  }
}

// Run table creation before Medusa starts
ensureTablesExist().catch(console.error)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    databaseDriverOptions: {
      ssl: false,
      sslmode: "disable",
    },
  }
})