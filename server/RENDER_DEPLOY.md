# Render Configuration for Job Portal Backend

## Service Configuration
- **Type**: Web Service
- **Name**: job-portal-backend
- **Environment**: Node
- **Region**: Oregon (US West) or closest to your users
- **Branch**: main
- **Root Directory**: server

## Build & Deploy Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Auto-Deploy**: Yes

## Environment Variables
Add these in Render Dashboard:

1. **NODE_ENV**: `production`
2. **MONGODB_URI**: `mongodb+srv://khanmkj:Khan%40123@khanjobdb.4cax3hj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=khanjobdb`
3. **JWT_SECRET**: `your-super-secret-jwt-key-for-production-make-it-long-and-random`
4. **CLIENT_URL**: `https://your-vercel-app-url.vercel.app` (update after frontend deployment)

## Health Check
- **Path**: `/health`
- **Port**: Uses `process.env.PORT` (automatically set by Render)

## Notes
- Render automatically installs dependencies using package.json
- File uploads are handled locally (consider using cloud storage for production)
- Database connection is configured for MongoDB Atlas
- CORS is configured to allow Vercel domains