const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert user so seed is idempotent
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  // Create project owned by the test user
  const project = await prisma.project.create({
    data: {
      name: 'TaskFlow Demo Project',
      description: 'A sample project pre-loaded with tasks to demonstrate TaskFlow.',
      owner_id: user.id,
    },
  });

  // Create 3 tasks with different statuses
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up project repository',
        description: 'Initialize Git repo, configure branch protection, and set up CI.',
        status: 'done',
        priority: 'high',
        project_id: project.id,
        assignee_id: user.id,
      },
      {
        title: 'Design database schema',
        description: 'Define all models and relationships, then create Prisma migrations.',
        status: 'in_progress',
        priority: 'medium',
        project_id: project.id,
        assignee_id: user.id,
      },
      {
        title: 'Build REST API endpoints',
        description: 'Implement full CRUD for projects and tasks with proper auth.',
        status: 'todo',
        priority: 'high',
        project_id: project.id,
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('   Email:    test@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
