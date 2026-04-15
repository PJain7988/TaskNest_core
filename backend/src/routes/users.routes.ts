import express, { Router } from 'express'
import { getUsers, updateUser, deleteUser, updateSettings, setup2FA, verify2FA, updatePassword } from '../controllers/userController'
import { protect } from '../middleware/auth'

const router: Router = express.Router()

router.use(protect)

router.get('/', getUsers)
router.put('/settings', updateSettings)
router.put('/password', updatePassword)
router.post('/2fa/setup', setup2FA)
router.post('/2fa/verify', verify2FA)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router
