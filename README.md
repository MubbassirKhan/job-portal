# Job Portal - Full Stack Application

A comprehensive job portal application built with React.js, Node.js, Express, and MongoDB. This platform connects job seekers with employers, featuring separate dashboards for candidates and administrators.

## Features

### For Candidates
- User registration and authentication
- Profile management with resume upload
- Job search with advanced filters
- Job application system
- Application tracking and status updates
- Dashboard with application analytics

### For Admins/Recruiters
- Job posting and management
- Application review and management
- Candidate search and filtering
- Analytics dashboard
- Application status updates

## Tech Stack

- **Frontend**: React.js, Material-UI, React Router, React Hook Form
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB with Mongoose
- **File Upload**: Multer for resume uploads
- **Security**: bcrypt.js, Helmet, Rate limiting

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd job-portal
```

2. Install dependencies for all components
```bash
npm run install-deps
```

3. Set up environment variables

Create `.env` file in the `server` directory:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://khanmkj:Khan%40123@khanjobdb.4cax3hj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=khanjobdb
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
CLIENT_URL=http://localhost:3000
```

4. Start the development servers
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Production Build

```bash
npm run build
```

## Project Structure

```
job-portal/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utilities and API calls
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # File uploads directory
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (admin only)
- `PUT /api/jobs/:id` - Update job (admin only)
- `DELETE /api/jobs/:id` - Delete job (admin only)

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications/my-applications` - Get user applications
- `PUT /api/applications/:id/status` - Update application status (admin)

### File Upload
- `POST /api/upload/resume` - Upload resume
- `GET /api/upload/resume/:filename` - Download resume
- `DELETE /api/upload/resume` - Delete resume

## Database Schema

### User Model
- Personal information (name, email, phone, location)
- Professional details (skills, experience, education)
- Role-based access (candidate/admin)
- Resume file reference

### Job Model
- Job details (title, company, description, requirements)
- Location and job type information
- Salary range and experience level
- Application deadline and status

### Application Model
- Job and candidate references
- Application status tracking
- Cover letter and notes
- Interview scheduling

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- File upload security
- CORS protection

## Deployment

### Backend (Render/Heroku)
1. Set environment variables
2. Deploy server directory
3. Set start command: `npm start`

### Frontend (Vercel/Netlify)
1. Build the client: `cd client && npm run build`
2. Deploy the `client/build` directory
3. Set up API URL environment variable

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Update MONGODB_URI in environment variables
3. Set up database user and network access

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.