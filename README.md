# Campus Lost & Found Portal

## Project Overview
The Campus Lost & Found Portal is a full-stack web application developed to help students report lost and found belongings within the university campus. It provides a centralized platform where students can report items, search for belongings, submit claims, and track their claim status.

## Features
- Student registration and login
- Secure password hashing
- Lost item reporting
- Found item reporting
- Search and filter items by type and category
- View items reported by the logged-in student
- Submit claims for found items
- Track claim status
- Admin dashboard
- Admin item management
- Admin claim approval and rejection
- Date-based sorting (Newest First and Oldest First)
- Admin dashboard statistics
- Duplicate claim prevention
- Prevention of claiming your own items
  
## Technologies Used

**Frontend**
- HTML5
- CSS3
- JavaScript (ES6)

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB Atlas

**Authentication and Security**
- bcrypt
- express-session
- connect-mongo

**Testing and Development**
- Postman
- Git
- GitHub

## Project Structure

```text
campus-lost-and-found/
├── public/
│   ├── admin-items.html
│   ├── admin-items.js
│   ├── admin.html
│   ├── admin.js
│   ├── dashboard.html
│   ├── dashboard.js
│   ├── index.html
│   ├── login.html
│   ├── login.js
│   ├── my-claims.html
│   ├── my-claims.js
│   ├── my-items.html
│   ├── my-items.js
│   ├── register.html
│   ├── register.js
│   ├── script.js
│   └── style.css
├── server.js
├── package.json
├── package-lock.json
└── .gitignore
```

## Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/thrishi3025/campus-lost-and-found.git
```

2. Open the project folder:

```bash
cd campus-lost-and-found
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file and configure the required MongoDB connection string and session secret.

5. Start the application:

```bash
npm start
```

6. Open the application in your browser:

```text
http://localhost:3000
```

## Database
The application uses MongoDB Atlas to store student accounts, reported items, and claim information.

## Testing
API endpoints and application functionality were tested using Postman, including:
- Retrieving all items
- Filtering lost and found items
- Filtering by category
- User authentication
- Protected item submission
- Claim submission
- Viewing claims
- Updating claim status
- Viewing items reported by the logged-in user

## Author
**Thrishika Thota**

B.Tech Computer Science  
School of Computing and Data Science  
Sai University

Academic Year: 2026–2027

## Project Title
Campus Lost & Found Portal
