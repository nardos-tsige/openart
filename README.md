# OpenArt

> A full-stack web application for sharing and exploring artistic images, built as a capstone project for the **THRIVE Women for Women Program**.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-Framework-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/TailwindCSS-Styling-38BDF8?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge&logo=jsonwebtokens" />
</p>

---

# 👨‍💻 Team Members

* **Nardos Tsige**
* **Yeabsra **

---

# 📖 Project Description

**OpenArt** is an image-sharing platform designed to empower artists by allowing them to:

* Upload and showcase artwork
* Interact through likes and comments
* Discover inspiring creations
* Connect with a creative community

The platform supports secure authentication, role-based access control, and a responsive user experience.

---

# ✨ Key Features

✅ User Authentication with JWT
✅ Role-Based Access Control (Creator, Viewer, Admin)
✅ Full CRUD Operations for Images
✅ Like & Comment System
✅ Category-Based Filtering
✅ Search Functionality
✅ Responsive UI with Tailwind CSS
✅ Cloudinary Image Upload Integration

---

# 🛠 Tech Stack

| Layer                | Technology                          |
| -------------------- | ----------------------------------- |
| 🎨 Frontend          | HTML, CSS, Tailwind CSS, JavaScript |
| ⚙️ Backend           | Express.js                          |
| 🗄 Database          | MongoDB Atlas                       |
| 🧩 Templating Engine | Handlebars                          |
| 🔐 Authentication    | JWT                                 |
| ☁️ File Storage      | Cloudinary                          |
| 🚀 Deployment        | Vercel                              |

---

# 📂 Project Structure

```text
openart/
├── config/         # Configuration files
├── controllers/    # Business logic
├── middleware/     # Authentication & upload middleware
├── models/         # Database schemas
├── routes/         # API and page routes
├── public/         # Static assets
├── views/          # Handlebars templates
├── server.js       # Application entry point
└── vercel.json     # Deployment configuration
```

---

# ⚡ Installation

## 📋 Prerequisites

Make sure you have installed:

* Node.js (v16 or higher)
* MongoDB Atlas account
* Cloudinary account

---

# 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

SESSION_SECRET=your_session_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

# 🚀 Setup Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/openart.git

# Navigate into project folder
cd openart

# Install dependencies
npm install

# Run development server
npm run dev
```

---

# 🌐 Run the Application

Visit:

```text
http://localhost:3000
```

---

# 🔌 API Endpoints

## 🔐 Authentication

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| POST   | `/api/auth/register` | Register user    |
| POST   | `/api/auth/login`    | Login user       |
| GET    | `/api/auth/me`       | Get current user |

---

## 🖼 Images

| Method | Endpoint                  | Description       | Access        |
| ------ | ------------------------- | ----------------- | ------------- |
| GET    | `/api/images`             | Get all images    | Public        |
| GET    | `/api/images/:id`         | Get single image  | Public        |
| POST   | `/api/images/upload`      | Upload image      | Creator/Admin |
| PUT    | `/api/images/:id`         | Update image      | Owner/Admin   |
| DELETE | `/api/images/:id`         | Delete image      | Owner/Admin   |
| POST   | `/api/images/:id/like`    | Like/Unlike image | Authenticated |
| POST   | `/api/images/:id/comment` | Add comment       | Authenticated |

---

## 👤 Users

| Method | Endpoint             | Description    | Access |
| ------ | -------------------- | -------------- | ------ |
| GET    | `/api/users/profile` | Get profile    |        |
| PUT    | `/api/users/profile` | Update profile |        |
| GET    | `/api/users/stats`   | Get stats      |        |
| DELETE | `/api/users/account` | Delete account |        |

---

# 🚀 Deployment

## Deploy to Vercel

### Steps

1. Push your code to GitHub
2. Import the repository into Vercel
3. Add environment variables
4. Deploy your application

---

# ✅ Requirements Checklist

| Requirement            | Status      |
| ---------------------- | ----------- |
| Full Stack Application | ✅ Completed |
| CRUD Features          | ✅ Completed |
| Multiple User Roles    | ✅ Completed |
| JWT Authentication     | ✅ Completed |
| Postman API Testing    | ✅ Included  |
| README Documentation   | ✅ Completed |

---

# 🧪 Postman Testing

Import the `postman-collection.json` file into Postman to test all API endpoints.

After logging in, set the token variable for authenticated routes.

---

# 📜 License

This project was developed as a capstone submission for the **THRIVE Women for Women Program**.

---

