const prisma = require('../utils/prisma');

async function getProjects(req, res) {
  const userId = req.user.id;

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { owner_id: userId },
        { tasks: { some: { assignee_id: userId } } },
      ],
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { created_at: 'desc' },
  });

  return res.json(projects);
}

async function createProject(req, res) {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'validation failed', fields: { name: 'Name is required' } });
  }

  const project = await prisma.project.create({
    data: { name: name.trim(), description: description?.trim() || null, owner_id: req.user.id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return res.status(201).json(project);
}

async function getProject(req, res) {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!project) return res.status(404).json({ error: 'Project not found' });
  return res.json(project);
}

async function updateProject(req, res) {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });

  const { name, description } = req.body;
  const data = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'validation failed', fields: { name: 'Name cannot be empty' } });
    }
    data.name = name.trim();
  }
  if (description !== undefined) {
    data.description = description?.trim() || null;
  }

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data,
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return res.json(updated);
}

async function deleteProject(req, res) {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });

  await prisma.project.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}

async function getProjectStats(req, res) {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const tasks = await prisma.task.findMany({
    where: { project_id: req.params.id },
    select: { status: true, assignee_id: true },
  });

  const by_status = { todo: 0, in_progress: 0, done: 0 };
  const by_assignee = {};

  for (const task of tasks) {
    by_status[task.status] = (by_status[task.status] || 0) + 1;
    if (task.assignee_id) {
      by_assignee[task.assignee_id] = (by_assignee[task.assignee_id] || 0) + 1;
    }
  }

  return res.json({ by_status, by_assignee });
}

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, getProjectStats };
