import express, { Router } from 'express'
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/authController'
import { protect } from '../middleware/auth'

const router: Router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

export default router
