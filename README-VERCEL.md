# Vercel Deployment Guide

## 🚀 Deploy to Vercel

This project has been configured for seamless deployment on Vercel. Follow these steps:

### Prerequisites
- Vercel account
- GitHub repository (recommended)
- Node.js 18+ locally for testing

### Quick Deploy

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy from CLI**
   ```bash
   vercel --prod
   ```

3. **Or Deploy via GitHub**
   - Push to GitHub
   - Import project in Vercel dashboard
   - Vercel will auto-detect the configuration

### Environment Variables

Set these in your Vercel dashboard:

```bash
NODE_ENV=production
SECRET_KEY=your-secret-key-here
MONGODB_URI=your-mongodb-connection-string
REDIS_URL=your-redis-connection-string
ENCRYPTION_KEY=your-encryption-key
```

### Project Structure for Vercel

```
project-D/
├── api/                    # Serverless functions
│   ├── index.js           # Main API endpoints
│   └── ai.py              # AI inference endpoints
├── drone-surveillance/    # Frontend React app
│   ├── src/
│   ├── public/
│   └── dist/              # Build output
├── vercel.json            # Vercel configuration
├── package.json           # Root package.json
└── requirements.txt       # Python dependencies
```

### Key Features Configured

✅ **Frontend**: React + Vite build optimized for Vercel  
✅ **Backend**: Node.js serverless functions  
✅ **AI Services**: Python serverless functions  
✅ **Static Assets**: Optimized bundle splitting  
✅ **Environment**: Production-ready configuration  
✅ **CORS**: Properly configured for production  
✅ **Rate Limiting**: API protection enabled  

### Build Process

The build process will:
1. Install frontend dependencies
2. Build React app with Vite
3. Deploy serverless functions
4. Configure routing

### API Endpoints

After deployment, your APIs will be available at:
- `https://your-app.vercel.app/api/health`
- `https://your-app.vercel.app/api/analytics/*`
- `https://your-app.vercel.app/api/defense/*`
- `https://your-app.vercel.app/api/ai/*`

### Limitations on Vercel

⚠️ **Note**: Some features are adapted for serverless:
- WebSocket connections use mock data
- Large AI models use lightweight inference
- Real-time features may have limitations
- File uploads are limited to 4.5MB

### Local Development

```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev

# Build for production
npm run build
```

### Troubleshooting

**Build Errors**:
- Check Node.js version (18+)
- Verify all dependencies are installed
- Check environment variables

**Runtime Errors**:
- Check Vercel function logs
- Verify API endpoints
- Check CORS configuration

### Production Considerations

For production military use:
- Use dedicated cloud infrastructure
- Implement proper database clustering
- Add comprehensive monitoring
- Enable advanced security features
- Use enterprise-grade WebSocket solutions
