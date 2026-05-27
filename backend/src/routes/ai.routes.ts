import express, { Router } from 'express'
import { summarizeProject, generateTasks, chatCopilot } from '../controllers/aiController'
import { protect } from '../middleware/auth'

const router: Router = express.Router()

// Ensure all AI endpoints are secured
router.use(protect)

router.get('/summarize/:projectId', summarizeProject)
router.post('/generate-tasks', generateTasks)
router.post('/chat', chatCopilot)

export default router
