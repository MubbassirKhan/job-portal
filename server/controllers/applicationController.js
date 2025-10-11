const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { logger } = require('../middleware/errorHandler');

// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private/Candidate
const applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Check if job exists and is active
    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or is no longer active'
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Create application
    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      coverLetter,
      resumeUrl: req.user.profile.resumeUrl
    });

    // Populate the application
    await application.populate([
      { path: 'jobId', select: 'title company location' },
      { path: 'candidateId', select: 'profile.firstName profile.lastName profile.email' }
    ]);

    logger.info(`New application: User ${req.user.email} applied to job ${job.title}`);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for current user (candidate)
// @route   GET /api/applications/my-applications
// @access  Private/Candidate
const getMyApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { candidateId: req.user.id };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('jobId', 'title company location jobType salaryRange')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId', 'profile email')
      .populate('statusUpdatedBy', 'profile.firstName profile.lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user has permission to view this application
    const isCandidate = req.user.id === application.candidateId._id.toString();
    const isJobPoster = req.user.id === application.jobId.postedBy.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCandidate && !isJobPoster && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (admin only)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes, feedback, interviewDate } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId', 'profile email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user has permission to update this application
    const isJobPoster = req.user.id === application.jobId.postedBy.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isJobPoster && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update application
    application.status = status;
    application.statusUpdatedBy = req.user.id;
    if (notes) application.notes = notes;
    if (feedback) application.feedback = feedback;
    if (interviewDate) application.interviewDate = interviewDate;

    await application.save();

    logger.info(`Application status updated: ${application._id} to ${status} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for admin
// @route   GET /api/applications/admin/all
// @access  Private/Admin
const getAllApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by job (if admin posted the job)
    if (req.query.jobId) {
      const job = await Job.findById(req.query.jobId);
      if (!job || (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view applications for this job'
        });
      }
      query.jobId = req.query.jobId;
    } else {
      // Only show applications for jobs posted by this admin
      const userJobs = await Job.find({ postedBy: req.user.id }).select('_id');
      query.jobId = { $in: userJobs.map(job => job._id) };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'jobId',
        select: 'title company location',
        options: { lean: true }
      })
      .populate({
        path: 'candidateId', 
        select: 'profile email',
        options: { lean: true }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private/Admin
const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user has permission
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { jobId: req.params.jobId };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('candidateId', 'profile email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    // Get application statistics for this job
    const stats = await Application.getApplicationStats(req.params.jobId);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private/Candidate
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns this application
    if (application.candidateId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }

    // Only allow deletion if application is still pending
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete application that has been reviewed'
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    logger.info(`Application deleted: ${req.params.id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplication,
  updateApplicationStatus,
  getAllApplications,
  getJobApplications,
  deleteApplication
};