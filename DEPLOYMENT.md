# 🚀 Vercel Deployment Guide for Prosperia

## Overview
This guide will help you deploy both your frontend and backend to Vercel with proper Google Cloud SQL database connection.

## Prerequisites
- Google Cloud SQL instance running
- Vercel account
- Environment variables ready

## Step 1: Deploy Backend to Vercel

### 1.1 Build the Backend
```bash
cd backend
npm run build
```

### 1.2 Deploy Backend
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy backend
cd backend
vercel --prod
```

### 1.3 Set Backend Environment Variables
In your Vercel dashboard, go to your backend project settings and add these environment variables:

```
DB_HOST=your-cloud-sql-instance-ip
DB_PORT=5432
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-database-name
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_API_KEY=your-firebase-api-key
```

**Important Notes:**
- For Google Cloud SQL, use the public IP address as `DB_HOST`
- Make sure your Cloud SQL instance allows connections from Vercel's IP ranges
- The `FIREBASE_PRIVATE_KEY` should include the full key with `\n` characters

## Step 2: Deploy Frontend to Vercel

### 2.1 Set Frontend Environment Variables
In your Vercel dashboard, go to your frontend project settings and add:

```
VITE_SERVER_URL=https://your-backend-url.vercel.app
```

### 2.2 Deploy Frontend
```bash
cd frontend
vercel --prod
```

## Step 3: Configure Google Cloud SQL

### 3.1 Enable Public IP
1. Go to Google Cloud Console
2. Navigate to SQL instances
3. Click on your instance
4. Go to "Connections" tab
5. Enable "Public IP" if not already enabled

### 3.2 Configure Authorized Networks
1. In the same "Connections" tab
2. Add Vercel's IP ranges to "Authorized networks":
   - `76.76.19.0/24`
   - `76.76.20.0/24`
   - `76.76.21.0/24`
   - `76.76.22.0/24`

### 3.3 Test Connection
You can test the connection using the backend's health check endpoint:
```
https://your-backend-url.vercel.app/
```

## Step 4: Verify Deployment

### 4.1 Check Backend Health
Visit: `https://your-backend-url.vercel.app/`
Should return: `the database is :your-database-name`

### 4.2 Test Frontend
Visit your frontend URL and try:
1. User authentication (should work)
2. Form submission (should now save to database)
3. Career recommendations (should work)

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check if Cloud SQL instance is running
   - Verify IP addresses in authorized networks
   - Check environment variables in Vercel

2. **CORS Errors**
   - Backend already has `cors({ origin: true })` which should handle this

3. **Environment Variables Not Loading**
   - Make sure to redeploy after adding environment variables
   - Check variable names match exactly

4. **Firebase Authentication Issues**
   - Verify Firebase project configuration
   - Check if private key is properly formatted

## Alternative: Use Vercel Postgres

If you want to avoid Google Cloud SQL complexity, consider using Vercel Postgres:

1. Add Vercel Postgres to your project
2. Update environment variables to use Vercel's connection string
3. Migrate your data from Cloud SQL

## Support

If you encounter issues:
1. Check Vercel function logs
2. Check Google Cloud SQL logs
3. Verify all environment variables are set correctly
4. Test database connection independently
