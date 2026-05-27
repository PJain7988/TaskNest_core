import express, { Router } from 'express'
import { summarizeProject, generateTasks, chatCopilot } from '../controllers/aiController'

const router: Router = express.Router()

router.get('/summarize/:projectId', summarizeProject)
router.post('/generate-tasks', generateTasks)
router.post('/chat', chatCopilot)

export default router
