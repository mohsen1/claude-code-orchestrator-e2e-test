// This is a test file to verify Prisma client setup
// Run it with: npx ts-node lib/prisma-test.ts

import prisma from './prisma'

async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Test query
    const userCount = await prisma.user.count()
    console.log(`✅ Current user count: ${userCount}`)

    console.log('✅ Prisma client is working correctly!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
