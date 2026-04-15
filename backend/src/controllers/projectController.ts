import { Request, Response } from 'express'
import Project from '../models/Project'
import Task from '../models/Task'
import User from '../models/User'

export const getProjects = async (req: any, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    }).populate('owner', 'name avatar')

    res.json({ success: true, data: projects })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getDashboardStats = async (req: any, res: Response) => {
  try {
    const userId = req.user.id

    // Get project counts
    const activeProjects = await Project.countDocuments({
      $or: [{ owner: userId }, { members: userId }],
      status: 'in-progress',
    })

    // Get task counts
    const tasks = await Task.find({
      $or: [{ assignedTo: userId }, { creator: userId }],
    })

    const completedTasks = tasks.filter((t) => t.status === 'done').length
    const pendingTasks = tasks.filter((t) => t.status !== 'done').length

    // Get user team count
    const teamMembersCount = await User.countDocuments() 

    // Calculate progress for chart (last 6 months - mock but structured)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const chartData = months.map((m) => ({
      name: m,
      completed: Math.floor(Math.random() * 50) + 20,
      pending: Math.floor(Math.random() * 20) + 5,
      total: 100,
    }))

    res.json({
      success: true,
      data: {
        stats: [
          { label: 'Active Projects', value: activeProjects, change: '+0', color: 'primary' },
          { label: 'Completed Tasks', value: completedTasks, change: '+0', color: 'success' },
          { label: 'Team Members', value: teamMembersCount, change: '+0', color: 'accent' },
          { label: 'Pending Tasks', value: pendingTasks, change: '+0', color: 'warning' },
        ],
        chartData,
        recentTasks: await Task.find({ assignedTo: userId })
          .sort({ updatedAt: -1 })
          .limit(4)
          .populate('project', 'name'),
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createProject = async (req: any, res: Response) => {
  try {
    const project = await Project.create({
      ...req.body,
      owner: req.user.id,
    })
    res.status(201).json({ success: true, data: project })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    res.json({ success: true, data: project })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    res.json({ success: true, message: 'Project deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
