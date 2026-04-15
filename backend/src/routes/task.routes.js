const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { updateTask, deleteTask } = require('../controllers/task.controller');

const router = Router();

router.use(authenticate);

router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
