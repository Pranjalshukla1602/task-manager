const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateTaskQuery
} = require('../utils/validators');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

// GET /api/tasks - Get all tasks with optional filtering and pagination
router.get('/', validateTaskQuery, getTasks);

// GET /api/tasks/:id - Get single task
router.get('/:id', validateTaskId, getTask);

// POST /api/tasks - Create new task
router.post('/', validateCreateTask, createTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', validateTaskId, validateUpdateTask, updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', validateTaskId, deleteTask);

module.exports = router;