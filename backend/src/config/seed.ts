import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'
import Project from '../models/Project'
import Task from '../models/Task'

dotenv.config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('Connected to MongoDB for seeding...')

    // Clear existing data cleanly
    await User.deleteMany({})
    try {
      await mongoose.connection.db?.dropCollection('projects')
    } catch (e) {
      console.log('Projects collection not found, skipping drop.')
    }
    try {
      await mongoose.connection.db?.dropCollection('tasks')
    } catch (e) {
      console.log('Tasks collection not found, skipping drop.')
    }

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@tasknest.com',
      password: 'password123',
      role: 'admin',
      appearanceSettings: { theme: 'dark', accentColor: '#4F46E5' }
    })

    // Create Team Members
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user'
    })

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'user'
    })

    console.log('Users seeded!')

    // Create Projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Modernizing the company landing page with new branding and animations.',
      owner: admin._id,
      members: [user1._id, user2._id],
      status: 'in-progress'
    })

    const project2 = await Project.create({
      name: 'Mobile App API',
      description: 'Developing the robust backend infrastructure for the upcoming iOS/Android app.',
      owner: admin._id,
      members: [user1._id],
      status: 'in-progress'
    })

    console.log('Projects seeded!')

    // Create Tasks
    await Task.create([
      {
        title: 'Design Hero Section',
        description: 'Create high-fidelity mockups for the landing page hero section.',
        project: project1._id,
        creator: admin._id,
        assignedTo: user1._id,
        status: 'in-progress',
        priority: 'high'
      },
      {
        title: 'Implement Auth logic',
        description: 'Set up JWT and middleware for the mobile API.',
        project: project2._id,
        creator: admin._id,
        assignedTo: admin._id,
        status: 'todo',
        priority: 'critical'
      },
      {
        title: 'Database Schema Design',
        description: 'Define models for users, projects and tasks.',
        project: project1._id,
        creator: admin._id,
        assignedTo: user2._id,
        status: 'done',
        priority: 'medium'
      },
      {
        title: 'CI/CD Pipeline',
        description: 'Set up GitHub Actions for automated testing.',
        project: project2._id,
        creator: admin._id,
        assignedTo: user1._id,
        status: 'review',
        priority: 'medium'
      }
    ])

    console.log('Tasks seeded!')
    console.log('All data seeded successfully! You can login with admin@tasknest.com / password123')
    process.exit()
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seedData()
