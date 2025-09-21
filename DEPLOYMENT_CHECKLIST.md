# 🚀 DEPLOYMENT CHECKLIST - Prosperia

## ✅ Pre-Deployment Checklist

### Backend Preparation
- [x] Backend compiled successfully (`npm run build`)
- [x] Database connection tested locally
- [x] Health check endpoints working
- [x] Environment variable validation added
- [x] SSL configuration for production
- [x] Error handling improved

### Configuration Files
- [x] `vercel.json` created for frontend
- [x] `backend/vercel.json` created for backend
- [x] `DEPLOYMENT.md` guide created
- [x] `deploy.sh` script created
- [x] `env.template` created

## 🚀 Deployment Steps

### Step 1: Deploy Backend
```bash
cd backend
vercel --prod
```

### Step 2: Set Backend Environment Variables
In Vercel Dashboard → Backend Project → Settings → Environment Variables:

```
DB_HOST=your-cloud-sql-public-ip
DB_PORT=5432
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_API_KEY=your-firebase-api-key
NODE_ENV=production
```

### Step 3: Deploy Frontend
```bash
cd frontend
vercel --prod
```

### Step 4: Set Frontend Environment Variables
In Vercel Dashboard → Frontend Project → Settings → Environment Variables:

```
VITE_SERVER_URL=https://your-backend-url.vercel.app
```

### Step 5: Configure Google Cloud SQL
1. Enable Public IP on your Cloud SQL instance
2. Add Vercel IP ranges to Authorized Networks:
   - `76.76.19.0/24`
   - `76.76.20.0/24`
   - `76.76.21.0/24`
   - `76.76.22.0/24`

## 🧪 Testing After Deployment

### Backend Tests
- [ ] `https://your-backend-url.vercel.app/health` → `{"status":"ok"}`
- [ ] `https://your-backend-url.vercel.app/` → Shows database info

### Frontend Tests
- [ ] User can log in with Google
- [ ] User data is saved to database
- [ ] Career form submission works
- [ ] AI questions are generated
- [ ] Recommendations are displayed

## 🔧 Troubleshooting

### Common Issues:
1. **Database Connection Failed**
   - Check Cloud SQL instance is running
   - Verify public IP is enabled
   - Check authorized networks include Vercel IPs
   - Verify environment variables are set correctly

2. **CORS Errors**
   - Backend has `cors({ origin: true })` - should work
   - Check if frontend URL is correct

3. **Environment Variables Not Loading**
   - Redeploy after adding environment variables
   - Check variable names match exactly
   - Ensure no extra spaces or quotes

4. **Firebase Authentication Issues**
   - Verify Firebase project configuration
   - Check private key format (should include `\n` characters)
   - Ensure Firebase project is active

## 📞 Support Commands

### Check Backend Logs
```bash
vercel logs your-backend-project-name
```

### Check Frontend Logs
```bash
vercel logs your-frontend-project-name
```

### Test Database Connection Locally
```bash
cd backend
npm start
curl http://localhost:5000/health
```

## 🎯 Success Criteria
- [ ] Users can authenticate
- [ ] User data is saved to database
- [ ] Career recommendations are generated
- [ ] All API endpoints respond correctly
- [ ] No CORS errors in browser console
- [ ] Database queries execute successfully
