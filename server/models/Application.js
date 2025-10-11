const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate ID is required']
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'interview', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now
  },
  statusUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  resumeUrl: {
    type: String
  },
  interviewDate: {
    type: Date
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate applications
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

// Other useful indexes
applicationSchema.index({ candidateId: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });

// Update statusUpdatedAt when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusUpdatedAt = new Date();
  }
  next();
});

// Virtual for time since application
applicationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.appliedAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
});

// Static method to get application statistics
applicationSchema.statics.getApplicationStats = async function(jobId = null) {
  const match = jobId ? { jobId: mongoose.Types.ObjectId(jobId) } : {};
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    reviewing: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Instance method to update job applications count
applicationSchema.post('save', async function() {
  const Job = mongoose.model('Job');
  await Job.findByIdAndUpdate(this.jobId, {
    $inc: { applicationsCount: 1 }
  });
});

applicationSchema.post('remove', async function() {
  const Job = mongoose.model('Job');
  await Job.findByIdAndUpdate(this.jobId, {
    $inc: { applicationsCount: -1 }
  });
});

module.exports = mongoose.model('Application', applicationSchema);