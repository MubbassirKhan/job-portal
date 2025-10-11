const Job = require('../models/Job');
const Application = require('../models/Application');
const { logger } = require('../middleware/errorHandler');

// @desc    Get all jobs with filtering and pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Search by text
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by location
    if (req.query.location) {
      query.location = new RegExp(req.query.location, 'i');
    }

    // Filter by job type
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    // Filter by experience level
    if (req.query.experienceLevel) {
      query.experienceLevel = req.query.experienceLevel;
    }

    // Filter by salary range
    if (req.query.minSalary || req.query.maxSalary) {
      query.$or = [];
      if (req.query.minSalary) {
        query.$or.push({ 'salaryRange.min': { $gte: parseInt(req.query.minSalary) } });
      }
      if (req.query.maxSalary) {
        query.$or.push({ 'salaryRange.max': { $lte: parseInt(req.query.maxSalary) } });
      }
    }

    // Sort options
    let sortBy = { createdAt: -1 };
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'newest':
          sortBy = { createdAt: -1 };
          break;
        case 'oldest':
          sortBy = { createdAt: 1 };
          break;
        case 'salary-high':
          sortBy = { 'salaryRange.max': -1 };
          break;
        case 'salary-low':
          sortBy = { 'salaryRange.min': 1 };
          break;
      }
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'profile.firstName profile.lastName')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'profile.firstName profile.lastName profile.bio')
      .populate({
        path: 'applications',
        match: { candidateId: req.user?.id },
        select: 'status appliedAt'
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    const job = await Job.create(jobData);
    
    logger.info(`New job created: ${job.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the creator or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    logger.info(`Job updated: ${job.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the creator or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    logger.info(`Job deleted: ${job.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by current user (admin)
// @route   GET /api/jobs/my-jobs
// @access  Private/Admin
const getMyJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('applications', 'status');

    const total = await Job.countDocuments({ postedBy: req.user.id });

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job statistics for admin
// @route   GET /api/jobs/stats
// @access  Private/Admin
const getJobStats = async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments({ postedBy: req.user.id });
    const activeJobs = await Job.countDocuments({ postedBy: req.user.id, isActive: true });
    const totalApplications = await Application.countDocuments();
    
    const applicationStats = await Application.getApplicationStats();

    const jobTypeStats = await Job.aggregate([
      { $match: { postedBy: req.user._id } },
      { $group: { _id: '$jobType', count: { $sum: 1 } } }
    ]);

    const recentJobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title applicationsCount createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        applicationStats,
        jobTypeStats,
        recentJobs
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getJobStats
};