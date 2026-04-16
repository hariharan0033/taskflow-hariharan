const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Two users (idempotent)
  const alice = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: { name: 'Alice (Test User)', email: 'test@example.com', password: hashedPassword },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { name: 'Bob Smith', email: 'bob@example.com', password: hashedPassword },
  });

  // ── Project 1: Website Redesign ──────────────────────────────
  const p1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Full redesign of the marketing site — new design system, CMS integration, and performance improvements.',
      owner_id: alice.id,
    },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Audit current site performance', description: 'Run Lighthouse on all key pages and document scores.', status: 'done', priority: 'medium', project_id: p1.id, assignee_id: alice.id, creator_id: alice.id, due_date: new Date('2024-02-01') },
      { title: 'Define new design tokens', description: 'Colors, typography, spacing — document in Figma.', status: 'done', priority: 'high', project_id: p1.id, assignee_id: alice.id, creator_id: alice.id },
      { title: 'Build reusable component library', description: 'Button, Card, Modal, Input — all variants.', status: 'done', priority: 'high', project_id: p1.id, assignee_id: bob.id, creator_id: alice.id },
      { title: 'Redesign homepage', description: 'Hero section, feature grid, testimonials, CTA.', status: 'done', priority: 'high', project_id: p1.id, assignee_id: bob.id, creator_id: alice.id },
      { title: 'Redesign pricing page', description: 'Three-tier pricing with feature comparison table.', status: 'in_progress', priority: 'high', project_id: p1.id, assignee_id: alice.id, creator_id: alice.id, due_date: new Date('2024-03-15') },
      { title: 'Integrate CMS for blog', description: 'Connect Contentful to the blog section.', status: 'in_progress', priority: 'medium', project_id: p1.id, assignee_id: bob.id, creator_id: alice.id },
      { title: 'Implement dark mode', description: 'CSS custom properties, system preference detection.', status: 'in_progress', priority: 'low', project_id: p1.id, assignee_id: alice.id, creator_id: alice.id },
      { title: 'Write end-to-end tests', description: 'Cypress tests for critical user flows.', status: 'todo', priority: 'medium', project_id: p1.id, creator_id: alice.id, due_date: new Date('2024-04-01') },
      { title: 'Accessibility audit', description: 'WCAG 2.1 AA compliance check across all pages.', status: 'todo', priority: 'high', project_id: p1.id, assignee_id: bob.id, creator_id: alice.id },
      { title: 'SEO metadata review', description: 'Title tags, meta descriptions, OG images for all routes.', status: 'todo', priority: 'low', project_id: p1.id, creator_id: alice.id },
      { title: 'Performance optimisation', description: 'Image lazy loading, code splitting, CDN setup.', status: 'todo', priority: 'medium', project_id: p1.id, assignee_id: alice.id, creator_id: alice.id },
      { title: 'Staging deployment', description: 'Deploy to Vercel preview env and share with stakeholders.', status: 'todo', priority: 'high', project_id: p1.id, assignee_id: bob.id, creator_id: alice.id, due_date: new Date('2024-04-10') },
    ],
  });

  // ── Project 2: Mobile App v2 ──────────────────────────────────
  const p2 = await prisma.project.create({
    data: {
      name: 'Mobile App v2',
      description: 'React Native rewrite of the iOS/Android app — offline support, push notifications, and redesigned UX.',
      owner_id: bob.id,
    },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Set up React Native project', description: 'Expo + TypeScript + ESLint + Prettier baseline.', status: 'done', priority: 'high', project_id: p2.id, assignee_id: bob.id, creator_id: bob.id },
      { title: 'Design onboarding flow', description: 'Figma mockups for signup, login, and first-run screens.', status: 'done', priority: 'high', project_id: p2.id, assignee_id: alice.id, creator_id: bob.id },
      { title: 'Implement auth screens', description: 'Login, register, forgot password with form validation.', status: 'done', priority: 'high', project_id: p2.id, assignee_id: bob.id, creator_id: bob.id },
      { title: 'Set up offline storage', description: 'SQLite via WatermelonDB for local-first data sync.', status: 'done', priority: 'medium', project_id: p2.id, assignee_id: bob.id, creator_id: bob.id },
      { title: 'Build home dashboard', description: 'Task summary cards, quick-add button, recent activity.', status: 'in_progress', priority: 'high', project_id: p2.id, assignee_id: alice.id, creator_id: bob.id, due_date: new Date('2024-03-20') },
      { title: 'Push notification integration', description: 'FCM + APNs setup, notification permission flow.', status: 'in_progress', priority: 'medium', project_id: p2.id, assignee_id: bob.id, creator_id: bob.id },
      { title: 'Implement deep linking', description: 'Universal links for task and project share URLs.', status: 'todo', priority: 'medium', project_id: p2.id, assignee_id: bob.id, creator_id: bob.id },
      { title: 'Write unit tests for core logic', description: 'Jest tests for state management and API layer.', status: 'todo', priority: 'medium', project_id: p2.id, creator_id: bob.id },
      { title: 'App Store submission prep', description: 'Screenshots, metadata, privacy policy, review guidelines check.', status: 'todo', priority: 'high', project_id: p2.id, assignee_id: alice.id, creator_id: bob.id, due_date: new Date('2024-05-01') },
      { title: 'Beta testing with 20 users', description: 'TestFlight + Play Console internal track, collect feedback.', status: 'todo', priority: 'medium', project_id: p2.id, creator_id: bob.id },
    ],
  });

  // ── Project 3: API Platform ───────────────────────────────────
  const p3 = await prisma.project.create({
    data: {
      name: 'API Platform',
      description: 'Internal developer platform — rate limiting, API key management, usage analytics, and developer docs.',
      owner_id: alice.id,
    },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Design API key schema', description: 'Hashed keys, scopes, expiry, revocation support.', status: 'done', priority: 'high', project_id: p3.id, assignee_id: alice.id, creator_id: alice.id },
      { title: 'Implement API key generation endpoint', description: 'POST /keys — create, name, set scopes.', status: 'done', priority: 'high', project_id: p3.id, assignee_id: alice.id, creator_id: alice.id },
      { title: 'Build rate limiting middleware', description: 'Token bucket algorithm, per-key limits, Redis-backed.', status: 'done', priority: 'high', project_id: p3.id, assignee_id: bob.id, creator_id: alice.id },
      { title: 'Usage analytics pipeline', description: 'Log every API call to ClickHouse, aggregate daily/monthly.', status: 'in_progress', priority: 'high', project_id: p3.id, assignee_id: alice.id, creator_id: alice.id, due_date: new Date('2024-03-25') },
      { title: 'Developer portal UI', description: 'Dashboard to view keys, usage graphs, and manage scopes.', status: 'in_progress', priority: 'medium', project_id: p3.id, assignee_id: bob.id, creator_id: alice.id },
      { title: 'OpenAPI spec documentation', description: 'Auto-generate docs from route annotations, publish to docs site.', status: 'in_progress', priority: 'medium', project_id: p3.id, assignee_id: alice.id, creator_id: alice.id },
      { title: 'Implement key revocation', description: 'DELETE /keys/:id — instant invalidation via Redis cache.', status: 'todo', priority: 'high', project_id: p3.id, assignee_id: bob.id, creator_id: alice.id },
      { title: 'Webhook delivery system', description: 'Retry queue, signature verification, delivery logs.', status: 'todo', priority: 'medium', project_id: p3.id, creator_id: alice.id, due_date: new Date('2024-04-15') },
      { title: 'SDK generation', description: 'Auto-generate TypeScript and Python SDKs from OpenAPI spec.', status: 'todo', priority: 'low', project_id: p3.id, assignee_id: alice.id, creator_id: alice.id },
      { title: 'Load testing', description: 'k6 test suite — 10k req/s sustained, measure p99 latency.', status: 'todo', priority: 'high', project_id: p3.id, assignee_id: bob.id, creator_id: alice.id, due_date: new Date('2024-04-20') },
      { title: 'Security penetration test', description: 'External pen test for auth bypass, injection, and key leakage.', status: 'todo', priority: 'high', project_id: p3.id, creator_id: alice.id },
    ],
  });

  console.log('Seed complete!');
  console.log('  alice -> Email: test@example.com  Password: password123');
  console.log('  bob   -> Email: bob@example.com   Password: password123');
  console.log('  Projects: 3   Tasks: 33');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
