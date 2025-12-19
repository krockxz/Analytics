import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  eventCount: number;
  pageViews: number;
  clicks: number;
  isActive: boolean;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
}

const SessionSchema: Schema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  endTime: {
    type: Date,
    index: true
  },
  eventCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  pageViews: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  lastActivity: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  userAgent: String,
  ipAddress: String,
  country: String,
  city: String
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      return ret;
    }
  }
});

// Indexes for session queries
SessionSchema.index({ startTime: -1 });
SessionSchema.index({ isActive: 1, lastActivity: -1 });

export const SessionModel = mongoose.model<ISession>('Session', SessionSchema);