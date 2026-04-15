import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User'
import Project from './models/Project'
import Task from './models/Task'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env') })

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('Connected to DB for seeding...')

    // Find the first user or create one
    let user = await User.findOne()
    if (!user) {
      console.log('No user found. Please register first.')
      process.exit(0)
    }

    console.log(`Seeding data for user: ${user.name} (${user.email})`)

    // Clear old data
    await Project.deleteMany({ owner: user._id })
    await Task.deleteMany({ creator: user._id })

    // Create projects
    const project1 = await Project.create({
      name: 'Dynamic Website build',
      description: 'A real project from the database',
      status: 'in-progress',
      progress: 45,
      owner: user._id,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    })

    const project2 = await Project.create({
      name: 'Mobile App API',
      description: 'Backend services for mobile',
      status: 'planning',
      progress: 10,
      owner: user._id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })

    // Create tasks
    await Task.create([
      {
        title: 'Design Database Schema',
        status: 'done',
        priority: 'high',
        project: project1._id,
        assignedTo: user._id,
        creator: user._id,
        dueDate: new Date()
      },
      {
        title: 'Implement Auth Routes',
        status: 'in-progress',
        priority: 'critical',
        project: project1._id,
        assignedTo: user._id,
        creator: user._id,
        dueDate: new Date()
      },
      {
        title: 'Setup API Documentation',
        status: 'todo',
        priority: 'medium',
        project: project2._id,
        assignedTo: user._id,
        creator: user._id,
        dueDate: new Date()
      }
    ])

    console.log('✅ Seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seedData()
