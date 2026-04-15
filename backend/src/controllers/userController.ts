import { Request, Response } from 'express'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find().select('-password')
  res.json({ success: true, data: users })
}

export const updateUser = async (req: any, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id || req.user.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password')

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  res.json({ success: true, data: user })
}

export const updatePassword = async (req: any, res: Response) => {
  const { current, new: newPassword } = req.body
  const user = await User.findById(req.user.id)

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  // Check current password
  const isMatch = await user.comparePassword(current)
  console.log('Password update attempt:', { 
    userId: user._id, 
    currentProvided: current ? '***' : 'missing',
    match: isMatch 
  })

  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' })
  }

  user.password = newPassword
  await user.save()

  res.json({ success: true, message: 'Password updated successfully' })
}

export const deleteUser = async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }
  res.json({ success: true, message: 'User deleted successfully' })
}

export const updateSettings = async (req: any, res: Response) => {
  const { notificationSettings, appearanceSettings, language } = req.body
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { notificationSettings, appearanceSettings, language },
    { new: true }
  ).select('-password')

  res.json({ success: true, data: user })
}

// 2FA Methods
export const setup2FA = async (req: any, res: Response) => {
  const secret = speakeasy.generateSecret({ name: `TaskNest (${req.user.email})` })
  
  await User.findByIdAndUpdate(req.user.id, {
    twoFactorSecret: secret.base32,
    twoFactorEnabled: false // Not enabled until verified
  })

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)
  res.json({ success: true, qrCode: qrCodeUrl, secret: secret.base32 })
}

export const verify2FA = async (req: any, res: Response) => {
  const { token } = req.body
  const user = await User.findById(req.user.id)

  if (!user || !user.twoFactorSecret) {
    return res.status(400).json({ success: false, message: '2FA not set up' })
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token
  })

  if (verified) {
    user.twoFactorEnabled = true
    await user.save()
    res.json({ success: true, message: '2FA verified and enabled' })
  } else {
    res.status(400).json({ success: false, message: 'Invalid token' })
  }
}
