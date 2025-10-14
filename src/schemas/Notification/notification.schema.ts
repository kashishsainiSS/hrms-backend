const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required : true
  },
  senderModel: {
    type: String,
    required: true,
    index: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },
  recipientModel: {
    type: String,
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'alert', 'reminder', 'announcement'],
    default: 'info',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['general', 'policy', 'event', 'task'],
    default: 'general',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
  },
  actions: [{
    type: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.index({ recipientModel: 1, recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
