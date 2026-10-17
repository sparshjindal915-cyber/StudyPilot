import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../utils/schemas.js';
import {
  listSubjects,
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  createSubjectSchema,
  updateSubjectSchema,
} from '../controllers/subjectController.js';

const router = Router();
router.use(protect);

router.get('/', listSubjects);
router.post('/', validate(createSubjectSchema), createSubject);
router.get('/:id', validate(idParam, 'params'), getSubject);
router.patch('/:id', validate(idParam, 'params'), validate(updateSubjectSchema), updateSubject);
router.delete('/:id', validate(idParam, 'params'), deleteSubject);

export default router;
