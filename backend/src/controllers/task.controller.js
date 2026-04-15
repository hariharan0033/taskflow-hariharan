const prisma = require('../utils/prisma');

const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

async function getTasks(req, res) {
  const { status, assignee } = req.query;

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const where = { project_id: req.params.id };
  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'validation failed', fields: { status: 'Invalid status value' } });
    }
    where.status = status;
  }
  if (assignee) {
    where.assignee_id = assignee;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: { assignee: { select: { id: true, name: true, email: true } } },
    orderBy: { created_at: 'desc' },
  });

  return res.json(tasks);
}

async function createTask(req, res) {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { title, description, status, priority, assignee_id, due_date } = req.body;

  const errors = {};
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.title = 'Title is required';
  }
  if (status && !VALID_STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    errors.priority = `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
  }
  if (due_date && isNaN(Date.parse(due_date))) {
    errors.due_date = 'Invalid date format';
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'validation failed', fields: errors });
  }

  if (assignee_id) {
    const assignee = await prisma.user.findUnique({ where: { id: assignee_id } });
    if (!assignee) {
      return res.status(400).json({ error: 'validation failed', fields: { assignee_id: 'User not found' } });
    }
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      status: status || 'todo',
      priority: priority || 'medium',
      project_id: req.params.id,
      assignee_id: assignee_id || null,
      due_date: due_date ? new Date(due_date) : null,
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });

  return res.status(201).json(task);
}

async function updateTask(req, res) {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { project: true },
  });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, status, priority, assignee_id, due_date } = req.body;
  const errors = {};

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    errors.title = 'Title cannot be empty';
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.priority = `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
  }
  if (due_date !== undefined && due_date !== null && isNaN(Date.parse(due_date))) {
    errors.due_date = 'Invalid date format';
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'validation failed', fields: errors });
  }

  if (assignee_id) {
    const assignee = await prisma.user.findUnique({ where: { id: assignee_id } });
    if (!assignee) {
      return res.status(400).json({ error: 'validation failed', fields: { assignee_id: 'User not found' } });
    }
  }

  const data = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (status !== undefined) data.status = status;
  if (priority !== undefined) data.priority = priority;
  if (assignee_id !== undefined) data.assignee_id = assignee_id || null;
  if (due_date !== undefined) data.due_date = due_date ? new Date(due_date) : null;

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data,
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });

  return res.json(updated);
}

async function deleteTask(req, res) {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { project: true },
  });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const isProjectOwner = task.project.owner_id === req.user.id;
  if (!isProjectOwner) {
    return res.status(403).json({ error: 'forbidden' });
  }

  await prisma.task.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
