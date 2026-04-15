import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const generateToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
  })
}

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body

  const userExists = await User.findOne({ email })
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' })
  }

  const user = await User.create({ name, email, password })
  if (user) {
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
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
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
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
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } else {
    res.status(404).json({ success: false, message: 'User not found' })
  }
}
