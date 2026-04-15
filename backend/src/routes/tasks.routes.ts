import express, { Router } from 'express'
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController'
import { protect } from '../middleware/auth'

const router: Router = express.Router()

router.use(protect)

router.get('/', getTasks)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
