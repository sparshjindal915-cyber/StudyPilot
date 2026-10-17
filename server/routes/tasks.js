import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../utils/schemas.js';
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  createTaskSchema,
  updateTaskSchema,
  listQuerySchema,
} from '../controllers/taskController.js';

const router = Router();
router.use(protect);

router.get('/', validate(listQuerySchema, 'query'), listTasks);
router.post('/', validate(createTaskSchema), createTask);
router.get('/:id', validate(idParam, 'params'), getTask);
router.patch('/:id', validate(idParam, 'params'), validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(idParam, 'params'), deleteTask);

export default router;
