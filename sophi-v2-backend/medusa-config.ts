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

    // Create tables one by one to avoid TypeScript parsing issues
    const tables = [
      // Currency table with all required columns
      `CREATE TABLE IF NOT EXISTS currency (
        code VARCHAR(3) PRIMARY KEY,
        symbol VARCHAR(10),
        symbol_native VARCHAR(10),
        name VARCHAR(255),
        includes_tax BOOLEAN DEFAULT false,
        decimal_digits INTEGER DEFAULT 2,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )`,

      // Tax Provider table with all required columns
      `CREATE TABLE IF NOT EXISTS tax_provider (
        id VARCHAR(255) PRIMARY KEY,
        is_installed BOOLEAN DEFAULT true,
        is_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )`,

      // Payment Provider table
      `CREATE TABLE IF NOT EXISTS payment_provider (
        id VARCHAR(255) PRIMARY KEY,
        is_installed BOOLEAN DEFAULT true,
        is_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )`,

      // Fulfillment Provider table
      `CREATE TABLE IF NOT EXISTS fulfillment_provider (
        id VARCHAR(255) PRIMARY KEY,
        is_installed BOOLEAN DEFAULT true,
        is_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )`,

      // Notification Provider table
      `CREATE TABLE IF NOT EXISTS notification_provider (
        id VARCHAR(255) PRIMARY KEY,
        is_installed BOOLEAN DEFAULT true,
        is_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )`,

      // Region table
      `CREATE TABLE IF NOT EXISTS region (
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
      )`,

      // Region Country table
      `CREATE TABLE IF NOT EXISTS region_country (
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
      )`
    ]

    // Execute table creation queries
    for (const tableQuery of tables) {
      await client.query(tableQuery)
    }

    // Insert default providers
    const insertQueries = [
      `INSERT INTO tax_provider (id, is_enabled) VALUES ('tp_system', true) ON CONFLICT (id) DO NOTHING`,
      `INSERT INTO payment_provider (id, is_enabled) VALUES ('pp_system_default', true) ON CONFLICT (id) DO NOTHING`,
      `INSERT INTO fulfillment_provider (id, is_enabled) VALUES ('fp_manual', true) ON CONFLICT (id) DO NOTHING`,
      `INSERT INTO notification_provider (id, is_enabled) VALUES ('np_sendgrid', true) ON CONFLICT (id) DO NOTHING`
    ]

    for (const insertQuery of insertQueries) {
      await client.query(insertQuery)
    }

    // Insert currencies including Nigerian Naira and others with decimal_digits
    const currencies = [
      { code: 'ngn', symbol: '₦', symbol_native: '₦', name: 'Nigerian Naira', decimal_digits: 2 },
      { code: 'usd', symbol: '$', symbol_native: '$', name: 'US Dollar', decimal_digits: 2 },
      { code: 'eur', symbol: '€', symbol_native: '€', name: 'Euro', decimal_digits: 2 },
      { code: 'gbp', symbol: '£', symbol_native: '£', name: 'British Pound Sterling', decimal_digits: 2 },
      { code: 'cad', symbol: 'CA$', symbol_native: '$', name: 'Canadian Dollar', decimal_digits: 2 },
      { code: 'aud', symbol: 'A$', symbol_native: '$', name: 'Australian Dollar', decimal_digits: 2 },
      { code: 'jpy', symbol: '¥', symbol_native: '¥', name: 'Japanese Yen', decimal_digits: 0 },
      { code: 'chf', symbol: 'CHF', symbol_native: 'CHF', name: 'Swiss Franc', decimal_digits: 2 },
      { code: 'cny', symbol: '¥', symbol_native: '¥', name: 'Chinese Yuan', decimal_digits: 2 },
      { code: 'inr', symbol: '₹', symbol_native: '₹', name: 'Indian Rupee', decimal_digits: 2 },
      { code: 'brl', symbol: 'R$', symbol_native: 'R$', name: 'Brazilian Real', decimal_digits: 2 },
      { code: 'krw', symbol: '₩', symbol_native: '₩', name: 'South Korean Won', decimal_digits: 0 },
      { code: 'mxn', symbol: '$', symbol_native: '$', name: 'Mexican Peso', decimal_digits: 2 },
      { code: 'zar', symbol: 'R', symbol_native: 'R', name: 'South African Rand', decimal_digits: 2 },
      { code: 'ghs', symbol: '₵', symbol_native: '₵', name: 'Ghanaian Cedi', decimal_digits: 2 },
      { code: 'xof', symbol: 'CFA', symbol_native: 'CFA', name: 'West African CFA Franc', decimal_digits: 0 },
      { code: 'xaf', symbol: 'FCFA', symbol_native: 'FCFA', name: 'Central African CFA Franc', decimal_digits: 0 },
      { code: 'kes', symbol: 'KSh', symbol_native: 'KSh', name: 'Kenyan Shilling', decimal_digits: 2 },
      { code: 'ugx', symbol: 'USh', symbol_native: 'USh', name: 'Ugandan Shilling', decimal_digits: 0 },
      { code: 'tzs', symbol: 'TSh', symbol_native: 'TSh', name: 'Tanzanian Shilling', decimal_digits: 2 }
    ]

    for (const currency of currencies) {
      await client.query(
        `INSERT INTO currency (code, symbol, symbol_native, name, decimal_digits) 
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING`,
        [currency.code, currency.symbol, currency.symbol_native, currency.name, currency.decimal_digits]
      )
    }

    // Insert Nigeria region
    await client.query(
      `INSERT INTO region (id, name, currency_code, tax_provider_id, tax_rate) 
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
      ['reg_nigeria', 'Nigeria', 'ngn', 'tp_system', 7.50]
    )

    // Insert default USD region
    await client.query(
      `INSERT INTO region (id, name, currency_code, tax_provider_id) 
       VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
      ['reg_default', 'International', 'usd', 'tp_system']
    )

    // Insert West Africa region
    await client.query(
      `INSERT INTO region (id, name, currency_code, tax_provider_id) 
       VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
      ['reg_west_africa', 'West Africa', 'xof', 'tp_system']
    )

    // Insert countries
    const countries = [
      { id: 'country_ng', iso_2: 'ng', iso_3: 'nga', num_code: 566, name: 'Nigeria', display_name: 'Nigeria', region_id: 'reg_nigeria' },
      { id: 'country_gh', iso_2: 'gh', iso_3: 'gha', num_code: 288, name: 'Ghana', display_name: 'Ghana', region_id: 'reg_west_africa' },
      { id: 'country_sn', iso_2: 'sn', iso_3: 'sen', num_code: 686, name: 'Senegal', display_name: 'Senegal', region_id: 'reg_west_africa' },
      { id: 'country_ci', iso_2: 'ci', iso_3: 'civ', num_code: 384, name: 'Côte d\'Ivoire', display_name: 'Ivory Coast', region_id: 'reg_west_africa' },
      { id: 'country_us', iso_2: 'us', iso_3: 'usa', num_code: 840, name: 'United States', display_name: 'United States', region_id: 'reg_default' },
      { id: 'country_gb', iso_2: 'gb', iso_3: 'gbr', num_code: 826, name: 'United Kingdom', display_name: 'United Kingdom', region_id: 'reg_default' },
      { id: 'country_ca', iso_2: 'ca', iso_3: 'can', num_code: 124, name: 'Canada', display_name: 'Canada', region_id: 'reg_default' }
    ]

    for (const country of countries) {
      await client.query(
        `INSERT INTO region_country (id, iso_2, iso_3, num_code, name, display_name, region_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
        [country.id, country.iso_2, country.iso_3, country.num_code, country.name, country.display_name, country.region_id]
      )
    }

    console.log('✅ Database tables ensured with Nigerian data')

  } catch (error) {
    console.error('❌ Database setup failed:', error instanceof Error ? error.message : 'Unknown error')
  } finally {
    await client.end()
  }
}

// Run table creation before Medusa starts
ensureTablesExist().catch(console.error)

export default defineConfig({
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