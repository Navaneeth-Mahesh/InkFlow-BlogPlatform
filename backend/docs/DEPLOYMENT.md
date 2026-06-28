# Deployment Guide

## 1. MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com.
2. Database Access → add a user with a strong password.
3. Network Access → add your deployment platform's IP, or `0.0.0.0/0` for dev.
4. Connect → Drivers → copy the `mongodb+srv://...` URI, fill in the password, add a database name (e.g. `/inkflow`).
5. Put it in `MONGODB_URI` in `.env`.

## 2. Cloudinary (optional)
Sign up at cloudinary.com, set `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`. Leave blank to use local-disk uploads (fine for dev, not for most hosts with ephemeral disks).

## 3. Backend (Render/Railway/Fly.io)
Build: `npm install && npm run build` · Start: `npm start`
Env vars: everything in `.env.example`, with `CLIENT_URL` set to your deployed frontend's real URL.
Generate production secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` (run twice).
Confirm `GET /health` returns 200, then optionally `npm run seed` once against the prod DB.

## 4. Frontend (Vercel)
Set `NEXT_PUBLIC_API_URL` to your deployed backend's `/api/v1` URL. Deploy. Then go back and set the backend's `CLIENT_URL` to the deployed frontend URL and redeploy the backend so CORS allows it.

## 5. Post-deploy checklist
- [ ] `/health` returns 200
- [ ] `/api/docs` renders
- [ ] Registering creates a real user in Atlas
- [ ] Publishing a blog shows up in `/feed`
- [ ] Deleting a blog from the profile page actually removes it (issue #5 regression check)
- [ ] Likes/bookmarks persist after refresh
- [ ] No CORS errors in the browser console
