const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

// Create a connection pool to PostgreSQL using our DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create the Prisma adapter using the connection pool
const adapter = new PrismaPg(pool)

// Create and export the Prisma client - this is what we use to query the database
const prisma = new PrismaClient({ adapter })

module.exports = prisma