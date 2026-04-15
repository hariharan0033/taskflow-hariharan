const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
} = require('../controllers/project.controller');
const { getTasks, createTask } = require('../controllers/task.controller');

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/:id/stats', getProjectStats);
router.get('/:id/tasks', getTasks);
router.post('/:id/tasks', createTask);

module.exports = router;
