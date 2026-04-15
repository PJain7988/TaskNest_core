import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
  name: string
  description: string
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold'
  progress: number
  owner: mongoose.Types.ObjectId
  members: mongoose.Types.ObjectId[]
  dueDate: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'review', 'completed', 'on-hold'],
      default: 'planning',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model<IProject>('Project', projectSchema)
