import { Request, Response } from 'express'
import Task from '../models/Task'

export const getTasks = async (req: any, res: Response) => {
  try {
    const tasks = await Task.find({
      $or: [{ assignedTo: req.user.id }, { creator: req.user.id }],
    }).populate('project', 'name')
    res.json({ success: true, data: tasks })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createTask = async (req: any, res: Response) => {
  try {
    const task = await Task.create({
      ...req.body,
      creator: req.user.id,
    })
    res.status(201).json({ success: true, data: task })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })
    res.json({ success: true, data: task })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })
    res.json({ success: true, message: 'Task deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
