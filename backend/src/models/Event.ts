import mongoose, { Schema, Document } from 'mongoose';
import { EventData } from '../../../shared/types/analytics';

export interface IEvent extends EventData, Document {}

const EventSchema: Schema = new Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['page_view', 'click'],
    index: true
  },
  url: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  data: {
    // Click event data
    x: Number,
    y: Number,
    element: String,
    elementId: String,
    elementClass: String,
    // Page view data
    title: String,
    referrer: String,
    userAgent: String,
    screenWidth: Number,
    screenHeight: Number
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      return ret;
    }
  }
});

// Compound indexes for better query performance
EventSchema.index({ sessionId: 1, timestamp: 1 });
EventSchema.index({ type: 1, timestamp: -1 });
EventSchema.index({ url: 1, type: 1, timestamp: -1 });

export const EventModel = mongoose.model<IEvent>('Event', EventSchema);