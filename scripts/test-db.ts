const { PrismaClient } = require('@prisma/client')
const testPrisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing database connection...')
    
    // Test connection by trying to get users
    const users = await testPrisma.user.findMany()
    console.log('Connected successfully!')
    console.log('Users found:', users)

    // Test creating a user
    const testUser = await testPrisma.user.upsert({
      where: { username: 'TestUser' },
      update: {},
      create: { username: 'TestUser' }
    })
    console.log('Test user created:', testUser)

  } catch (error) {
    console.error('Database error:', error)
  } finally {
    await testPrisma.$disconnect()
  }
}

main() 