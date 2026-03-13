# Package Instructions

Backend:
1. `cd backend`
2. `npm install`
3. Create `.env` using values from root `.env.example`
4. `node server.js`

Frontend:
1. `cd frontend`
2. `npm install`
3. Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` (default: `http://localhost:5000`)
4. `npm run dev`

Recommended:
- Use MongoDB Atlas for `MONGO_URI`
- Use Node.js 18+ for both backend and frontend
