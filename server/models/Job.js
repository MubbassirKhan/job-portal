const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true
  },
  salaryRange: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    }
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    default: 'mid'
  },
  skills: [{
    type: String,
    trim: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId'
});

// Index for search functionality
jobSchema.index({ 
  title: 'text', 
  description: 'text', 
  company: 'text',
  skills: 'text'
});

jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isActive: 1 });

// Validation for salary range
jobSchema.pre('save', function(next) {
  if (this.salaryRange.min && this.salaryRange.max) {
    if (this.salaryRange.min > this.salaryRange.max) {
      return next(new Error('Minimum salary cannot be greater than maximum salary'));
    }
  }
  next();
});

// Update applications count
jobSchema.methods.updateApplicationsCount = async function() {
  const Application = mongoose.model('Application');
  this.applicationsCount = await Application.countDocuments({ jobId: this._id });
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);