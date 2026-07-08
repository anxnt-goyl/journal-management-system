<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Journal Management System

A full-stack journal management system built with React, TypeScript, Vite, Express, Node.js, and MongoDB.

## Architecture

- Frontend: React + Vite + TypeScript
- Backend: Express + Node.js
- Database: MongoDB with Mongoose
- API: REST endpoints under /api

## Run Locally

**Prerequisites:** Node.js and MongoDB

1. Install dependencies:
   `npm install`
2. Copy [.env.example](.env.example) to .env and configure your values
3. Start the backend:
   `npm run dev:server`
4. Start the frontend:
   `npm run dev`

## API Endpoints

- `GET /api/health`
- `GET /api/users`
- `GET /api/papers`
- `POST /api/papers`
- `GET /api/issues`
- `GET /api/announcements`

## Notes

- The frontend remains functional with the existing mock data layer even if MongoDB is unavailable.
- The API is designed to be extended with authentication, file uploads, and admin workflows.
