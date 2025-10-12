import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, CloudUpload, Delete, Visibility } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { uploadAPI } from '../utils/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [resumeDialog, setResumeDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        skills: user.profile?.skills?.join(', ') || '',
        experience: user.profile?.experience || 0,
        education: user.profile?.education || '',
        bio: user.profile?.bio || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const profileData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setEditMode(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploadLoading(true);
    try {
      await uploadAPI.uploadResume(formData);
      toast.success('Resume uploaded successfully!');
      // Refresh user data
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleResumeDelete = async () => {
    try {
      await uploadAPI.deleteResume();
      toast.success('Resume deleted successfully!');
      setResumeDialog(false);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resume');
    }
  };

  const handleResumeView = () => {
    if (user.profile?.resumeUrl) {
      // Open resume in new tab
      window.open(`https://job-1-5csh.onrender.com${user.profile.resumeUrl}`, '_blank');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Profile
        </Typography>
        {!editMode && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            {editMode ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...register('firstName', { required: 'First name is required' })}
                      label="First Name"
                      fullWidth
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...register('lastName', { required: 'Last name is required' })}
                      label="Last Name"
                      fullWidth
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...register('phone')}
                      label="Phone Number"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...register('location')}
                      label="Location"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...register('experience')}
                      label="Years of Experience"
                      type="number"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...register('education')}
                      label="Education"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('skills')}
                      label="Skills (comma separated)"
                      fullWidth
                      helperText="e.g., JavaScript, React, Node.js"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('bio')}
                      label="Bio"
                      multiline
                      rows={4}
                      fullWidth
                      helperText="Tell us about yourself"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : null}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditMode(false);
                          reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {user.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {user.profile?.phone || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {user.profile?.location || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Experience
                  </Typography>
                  <Typography variant="body1">
                    {user.profile?.experience ? `${user.profile.experience} years` : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Education
                  </Typography>
                  <Typography variant="body1">
                    {user.profile?.education || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Skills
                  </Typography>
                  <Box mt={1}>
                    {user.profile?.skills?.length > 0 ? (
                      user.profile.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No skills added
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bio
                  </Typography>
                  <Typography variant="body1">
                    {user.profile?.bio || 'No bio provided'}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Resume Section (for candidates) */}
        {user.role === 'candidate' && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resume
              </Typography>
              
              {user.profile?.resumeUrl ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Resume uploaded successfully
                  </Alert>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={handleResumeView}
                      fullWidth
                    >
                      View Resume
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => setResumeDialog(true)}
                      fullWidth
                    >
                      Delete Resume
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Upload your resume to apply for jobs
                  </Alert>
                  <input
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="resume-upload"
                    type="file"
                    onChange={handleResumeUpload}
                  />
                  <label htmlFor="resume-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={uploadLoading ? <CircularProgress size={16} /> : <CloudUpload />}
                      disabled={uploadLoading}
                      fullWidth
                    >
                      {uploadLoading ? 'Uploading...' : 'Upload Resume'}
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                    Supported formats: PDF, DOC, DOCX (Max 5MB)
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Resume Delete Confirmation Dialog */}
      <Dialog open={resumeDialog} onClose={() => setResumeDialog(false)}>
        <DialogTitle>Delete Resume</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your resume? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResumeDialog(false)}>Cancel</Button>
          <Button onClick={handleResumeDelete} color="error" variant="contained">
            Delete Resume
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;