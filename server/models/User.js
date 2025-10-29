const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    location: {
      type: String,
      trim: true
    },
    skills: [{
      type: String,
      trim: true
    }],
    experience: {
      type: Number,
      min: 0,
      default: 0
    },
    education: {
      type: String,
      trim: true
    },
    resumeUrl: {
      type: String
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    profileImage: {
      type: String
    },
    coverImage: {
      type: String
    },
    headline: {
      type: String,
      maxlength: [100, 'Headline cannot exceed 100 characters']
    },
    company: {
      type: String,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    website: {
      type: String
    },
    jobTitle: {
      type: String,
      trim: true
    },
    linkedin: String,
    github: String,
    twitter: String,
    birthDate: Date,
    nationality: String,
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'prefer-not-to-say']
    },
    // Detailed arrays for comprehensive profile
    educationDetails: [{
      id: String,
      degree: String,
      institution: String,
      fieldOfStudy: String,
      startDate: String,
      endDate: String,
      grade: String,
      description: String
    }],
    workExperience: [{
      id: String,
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      description: String,
      achievements: [String]
    }],
    skillsDetailed: [{
      id: String,
      name: String,
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
      },
      category: String
    }],
    certifications: [{
      id: String,
      name: String,
      issuer: String,
      issueDate: String,
      expiryDate: String,
      credentialId: String,
      url: String
    }],
    languages: [{
      id: String,
      name: String,
      proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Native']
      }
    }],
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String
    },
    isProfilePublic: {
      type: Boolean,
      default: true
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Social features
  connectionCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  // Notification preferences
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    connections: {
      type: Boolean,
      default: true
    },
    messages: {
      type: Boolean,
      default: true
    }
  },
  // Last activity tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Index for text search
userSchema.index({ 
  'profile.firstName': 'text', 
  'profile.lastName': 'text', 
  'profile.skills': 'text' 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);