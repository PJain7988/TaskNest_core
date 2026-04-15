import express, { Router } from 'express'
import { getProjects, getDashboardStats, createProject, updateProject, deleteProject } from '../controllers/projectController'
import { protect } from '../middleware/auth'

const router: Router = express.Router()

router.use(protect)

// Get dashboard stats
router.get('/stats', getDashboardStats)

// Projects CRUD
router.get('/', getProjects)
router.post('/', createProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

export default router
