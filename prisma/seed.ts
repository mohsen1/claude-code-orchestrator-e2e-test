import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      id: 'user1',
      email: 'john@example.com',
      name: 'John Doe',
      image: 'https://avatar.vercel.sh/john',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      id: 'user2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      image: 'https://avatar.vercel.sh/jane',
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      id: 'user3',
      email: 'bob@example.com',
      name: 'Bob Johnson',
      image: 'https://avatar.vercel.sh/bob',
    },
  })

  console.log('Created users:', { user1, user2, user3 })

  // Create groups
  const group1 = await prisma.group.upsert({
    where: { id: 'group1' },
    update: {},
    create: {
      id: 'group1',
      name: 'Trip to Paris',
      description: 'Summer vacation 2024',
    },
  })

  const group2 = await prisma.group.upsert({
    where: { id: 'group2' },
    update: {},
    create: {
      id: 'group2',
      name: 'Apartment Expenses',
      description: 'Monthly shared expenses',
    },
  })

  console.log('Created groups:', { group1, group2 })

  // Add group members
  await prisma.groupMember.upsert({
    where: {
      id: 'member1',
    },
    update: {},
    create: {
      id: 'member1',
      groupId: 'group1',
      userId: 'user1',
      role: 'admin',
    },
  })

  await prisma.groupMember.upsert({
    where: {
      id: 'member2',
    },
    update: {},
    create: {
      id: 'member2',
      groupId: 'group1',
      userId: 'user2',
      role: 'member',
    },
  })

  await prisma.groupMember.upsert({
    where: {
      id: 'member3',
    },
    update: {},
    create: {
      id: 'member3',
      groupId: 'group1',
      userId: 'user3',
      role: 'member',
    },
  })

  await prisma.groupMember.upsert({
    where: {
      id: 'member4',
    },
    update: {},
    create: {
      id: 'member4',
      groupId: 'group2',
      userId: 'user1',
      role: 'admin',
    },
  })

  await prisma.groupMember.upsert({
    where: {
      id: 'member5',
    },
    update: {},
    create: {
      id: 'member5',
      groupId: 'group2',
      userId: 'user2',
      role: 'member',
    },
  })

  console.log('Added group members')

  // Create expenses
  const expense1 = await prisma.expense.upsert({
    where: { id: 'expense1' },
    update: {},
    create: {
      id: 'expense1',
      title: 'Hotel Booking',
      description: '3 nights at Hotel Paris',
      amount: 450,
      currency: 'USD',
      date: new Date('2024-06-15'),
      groupId: 'group1',
      paidBy: 'user1',
      createdBy: 'user1',
    },
  })

  const expense2 = await prisma.expense.upsert({
    where: { id: 'expense2' },
    update: {},
    create: {
      id: 'expense2',
      title: 'Dinner at Restaurant',
      description: 'Nice dinner in town',
      amount: 120,
      currency: 'USD',
      date: new Date('2024-06-16'),
      groupId: 'group1',
      paidBy: 'user2',
      createdBy: 'user2',
    },
  })

  const expense3 = await prisma.expense.upsert({
    where: { id: 'expense3' },
    update: {},
    create: {
      id: 'expense3',
      title: 'Museum Tickets',
      description: 'Louvre museum entry',
      amount: 60,
      currency: 'USD',
      date: new Date('2024-06-17'),
      groupId: 'group1',
      paidBy: 'user3',
      createdBy: 'user3',
    },
  })

  const expense4 = await prisma.expense.upsert({
    where: { id: 'expense4' },
    update: {},
    create: {
      id: 'expense4',
      title: 'Electric Bill',
      description: 'Monthly electricity',
      amount: 150,
      currency: 'USD',
      date: new Date('2024-01-01'),
      groupId: 'group2',
      paidBy: 'user1',
      createdBy: 'user1',
    },
  })

  console.log('Created expenses:', { expense1, expense2, expense3, expense4 })

  // Create expense splits (equal splits)
  const splitAmount1 = expense1.amount / 3
  await prisma.expenseSplit.upsert({
    where: { id: 'split1' },
    update: {},
    create: {
      id: 'split1',
      expenseId: 'expense1',
      userId: 'user1',
      amount: splitAmount1,
    },
  })

  await prisma.expenseSplit.upsert({
    where: { id: 'split2' },
    update: {},
    create: {
      id: 'split2',
      expenseId: 'expense1',
      userId: 'user2',
      amount: splitAmount1,
    },
  })

  await prisma.expenseSplit.upsert({
    where: { id: 'split3' },
    update: {},
    create: {
      id: 'split3',
      expenseId: 'expense1',
      userId: 'user3',
      amount: splitAmount1,
    },
  })

  const splitAmount2 = expense2.amount / 3
  await prisma.expenseSplit.upsert({
    where: { id: 'split4' },
    update: {},
    create: {
      id: 'split4',
      expenseId: 'expense2',
      userId: 'user1',
      amount: splitAmount2,
    },
  })

  await prisma.expenseSplit.upsert({
    where: { id: 'split5' },
    update: {},
    create: {
      id: 'split5',
      expenseId: 'expense2',
      userId: 'user2',
      amount: splitAmount2,
    },
  })

  await prisma.expenseSplit.upsert({
    where: { id: 'split6' },
    update: {},
    create: {
      id: 'split6',
      expenseId: 'expense2',
      userId: 'user3',
      amount: splitAmount2,
    },
  })

  const splitAmount3 = expense3.amount / 3
  await prisma.expenseSplit.upsert({
    where: { id: 'split7' },
    update: {},
    create: {
      id: 'split7',
      expenseId: 'expense3',
      userId: 'user1',
      amount: splitAmount3,
    },
  })

  await prisma.expenseSplit.upsert({
    where: { id: 'split8' },
    update: {},
    create: {
      id: 'split8',
      expenseId: 'expense3',
      userId: 'user2',
      amount: splitAmount3,
    },
  })

  await prisma.expenseSplit.upsert({
    where: { id: 'split9' },
    update: {},
    create: {
      id: 'split9',
      expenseId: 'expense3',
      userId: 'user3',
      amount: splitAmount3,
    },
  })

  const splitAmount4 = expense4.amount / 2
  await prisma.expenseSplit.upsert({
    where: { id: 'split10' },
    update: {},
    create: {
      id: 'split10',
      expenseId: 'expense4',
      userId: 'user1',
      amount: splitAmount4,
    },
  })

  await prisma.expenseSplit.upsert({
    where: { id: 'split11' },
    update: {},
    create: {
      id: 'split11',
      expenseId: 'expense4',
      userId: 'user2',
      amount: splitAmount4,
    },
  })

  console.log('Created expense splits')

  // Create balances (calculated based on expenses)
  // For group1 (Trip to Paris):
  // John paid $450, owes $40 total ($150 + $133.33 - $210 = $73.33 net owed to John)
  // Jane paid $120, owes $40 total ($210 - $150 = $60 net owed to Jane)
  // Bob paid $60, owes $40 total ($20 - $150 = -$130 net Bob owes)

  await prisma.balance.upsert({
    where: { id: 'balance1' },
    update: {},
    create: {
      id: 'balance1',
      groupId: 'group1',
      owerId: 'user3',
      receiverId: 'user1',
      amount: 73.33,
      settled: false,
    },
  })

  await prisma.balance.upsert({
    where: { id: 'balance2' },
    update: {},
    create: {
      id: 'balance2',
      groupId: 'group1',
      owerId: 'user3',
      receiverId: 'user2',
      amount: 60.00,
      settled: false,
    },
  })

  // For group2 (Apartment Expenses):
  // John paid $150, owes $75 = $75 credit
  // Jane paid $0, owes $75 = $75 debit

  await prisma.balance.upsert({
    where: { id: 'balance3' },
    update: {},
    create: {
      id: 'balance3',
      groupId: 'group2',
      owerId: 'user2',
      receiverId: 'user1',
      amount: 75.00,
      settled: false,
    },
  })

  console.log('Created balances')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
