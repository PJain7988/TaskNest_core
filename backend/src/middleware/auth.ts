import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

export interface AuthRequest extends Request {
  user?: IUser
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' })
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string)
    req.user = (await User.findById(decoded.id).select('-password')) as IUser
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' })
  }
}
