import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User'
import { sendResetPasswordEmail } from '../utils/mail'


const generateToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
  })
}

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body

  const userExists = await User.findOne({ email })
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' })
  }

  const user = await User.create({ name, email, password, role })
  if (user) {
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        language: user.language,
        appearanceSettings: user.appearanceSettings,
        notificationSettings: user.notificationSettings,
        twoFactorEnabled: user.twoFactorEnabled
      },
    })
  } else {
    res.status(400).json({ success: false, message: 'Invalid user data' })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  console.log('Login attempt:', { email, found: !!user })
  
  if (user && (await user.comparePassword(password))) {
    console.log('Login successful for:', email)
    res.json({
      success: true,
      token: generateToken(user._id),
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        language: user.language,
        appearanceSettings: user.appearanceSettings,
        notificationSettings: user.notificationSettings,
        twoFactorEnabled: user.twoFactorEnabled
      },
    })
  } else {
    console.log('Login failed for:', email)
    res.status(401).json({ success: false, message: 'Invalid email or password' })
  }
}

export const getMe = async (req: any, res: Response) => {
  const user = await User.findById(req.user.id)
  if (user) {
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        language: user.language,
        appearanceSettings: user.appearanceSettings,
        notificationSettings: user.notificationSettings,
        twoFactorEnabled: user.twoFactorEnabled
      },
    })
  } else {
    res.status(404).json({ success: false, message: 'User not found' })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist' })
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Set token and expiry on user object
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour

    await user.save()

    // Send email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`
    await sendResetPasswordEmail(user.email, resetUrl)

    res.json({ success: true, message: 'Password reset link sent to your email' })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    res.status(500).json({ success: false, message: 'Server error, failed to send reset email' })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params
  const { password } = req.body

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' })
    }

    // Set new password (the pre-save middleware will automatically hash it)
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    res.json({ success: true, message: 'Password reset successful' })
  } catch (error: any) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, message: 'Server error, failed to reset password' })
  }
}

