# لقطة | Lakta — Freelance Web Services Platform

A web platform where clients can browse and order custom website development services. Built and deployed to production as a solo project.

## What It Does

- Clients visit the site and submit requests for a custom website
- An admin panel lets the owner manage incoming orders and client details
- Clean, professional landing page presenting the service offering

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Deployment | Deployed to live production environment |

## Project Structure

```
lakta-backend/
├── css/           # Stylesheets
├── js/            # Frontend JavaScript
├── index.html     # Main landing page
├── admin.html     # Admin dashboard
├── admin-login.html # Admin login page
├── server.js      # Express.js backend server
└── package.json   # Project dependencies
```

## Running Locally

```bash
# Clone the repo
git clone https://github.com/Abd-Alrahman12/lakta-backend.git
cd lakta-backend

# Install dependencies
npm install

# Start the server
node server.js
```

Then open `http://localhost:3000` in your browser.

## About

Built by Abd-Alrahman Khalid as a personal project to offer freelance web development services. This was an early experiment in full-stack development and deploying a real product to production.

---

> "From idea to deployed product — solo."
