# 📜 User Profile Management API

A RESTful API for user profile management with authentication using **Express.js**, **MongoDB**, and **JWT**.

## 🚀 Features

- ✔ **User registration and authentication** (JWT-based)
- ✔ **Secure password hashing** using **bcrypt**
- ✔ **Protected routes** (users can access/update only their own profiles)
- ✔ **Proper error handling** for better API stability
- ✔ **MongoDB integration** using **Mongoose**
- ✔ **CORS and Helmet** for security

---

## 🛠 Tech Stack

| Technology     | Description                     |
| -------------- | ------------------------------- |
| **Node.js**    | Runtime environment             |
| **Express.js** | Backend framework               |
| **MongoDB**    | NoSQL database                  |
| **JWT**        | Authentication                  |
| **bcryptjs**   | Password hashing                |
| **dotenv**     | Environment variable management |
| **Helmet**     | Security enhancements           |
| **CORS**       | Cross-Origin Resource Sharing   |

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/user-profile-api.git
cd user-profile-api


2️⃣ Install Dependencies

npm install
or install required dependencies manually:

npm i express mongoose dotenv bcryptjs jsonwebtoken helmet cors morgan express-validator
3️⃣ Set Up Environment Variables
Create a .env file in the root directory.

Refer to .env.sample for required variables.

4️⃣ Run the Server
For development:

npm run dev
The API will be available at: http://localhost:8000

📌 API Endpoints
POST	/api/users/register	Register a new user
POST	/api/users/login	Login and get JWT
GET	  /api/users/profile	Get user profile
PUT	  /api/users/profile	Update user profile


📜 Detailed API Documentation

🔹 User Registration
Endpoint: POST /api/users/register

Description: Registers a new user.

Request Body:

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "123 Street, City",
  "bio": "Software Developer",
  "profilePic": "https://example.com/profile.jpg"
}
Response:

{
  "message": "User registered successfully!"
}
🔹 User Login
Endpoint: POST /api/users/login

Description: Authenticates user and returns a JWT token.

Request Body:

{
  "email": "john@example.com",
  "password": "password123"
}
🔹 Get User Profile (Protected)
Endpoint: GET /api/users/profile

Description: Retrieves the authenticated user's profile.

Headers:

{
  "Authorization": "Bearer your_jwt_token"
}

🔹 Update Profile (Protected)
Endpoint: PUT /api/users/profile

Description: Updates user profile details.

Headers:

{
  "Authorization": "Bearer your_jwt_token"
}

Request Body:

{
  "name": "John Updated",
  "address": "456 New Street, City",
  "bio": "Senior Developer",
  "profilePic": "https://example.com/new-profile.jpg"
}


📜 License
This project is licensed under the MIT License.

```
