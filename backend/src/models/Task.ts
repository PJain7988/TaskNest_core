import mongoose, { Schema, Document } from 'mongoose'

export interface ITask extends Document {
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  project?: mongoose.Types.ObjectId
  assignedTo?: mongoose.Types.ObjectId
  creator: mongoose.Types.ObjectId
  dueDate?: Date
  tags?: string[]
  estimatedHours?: number
  attachmentLink?: string
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    tags: [{ type: String }],
    estimatedHours: { type: Number },
    attachmentLink: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model<ITask>('Task', taskSchema)
