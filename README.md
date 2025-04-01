# 📜 User Profile Management API

A RESTful API for user profile management with authentication using **Express.js, MongoDB, and JWT**.

## 🚀 Features

✔ User registration and authentication (**JWT-based**)  
✔ Secure password hashing using **bcrypt**  
✔ **Protected routes** (users can access/update only their own profiles)  
✔ **Proper error handling** for better API stability  
✔ **MongoDB integration** using **Mongoose**  
✔ **CORS and Helmet** for security

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

## 📂 Folder Structure

src/
│── controllers/ # Controller functions for handling business logic
│── db/ # Database connection and initialization
│── middlewares/ # Custom middlewares (e.g., authentication)
│── models/ # Mongoose models (User Schema)
│── routes/ # API route definitions
│── utils/ # Utility functions (e.g., error handling)
│── public/ # Public assets (if needed)
│── uploads/ # For profile picture uploads (if implemented)
│── views/ # Views (if using a templating engine like EJS)
│── app.js # Main Express app file
│── index.js # Entry point
│── constants.js # Store app-wide constants
│── .env.sample # Environment variables sample file
│── .gitignore # Ignore unnecessary files in Git
│── package.json # Project metadata and dependencies
│── README.md # Project documentation

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone [https://github.com/your-username/user-profile-api.git](https://github.com/your-username/user-profile-api.git)
cd user-profile-api

2️⃣ Install Dependencies
npm install

Alternatively, install the required dependencies manually:
npm i express mongoose dotenv bcryptjs jsonwebtoken helmet cors morgan express-validator

3️⃣ Set Up Environment Variables
Create a .env file in the root directory and refer to .env.sample for required variables.

4️⃣ Run the Server
For development:
npm run dev

The API will be available at: http://localhost:8000 (or the port specified in your .env file).

📌 API Endpoints
POST	/api/users/register	Register a new user
POST	/api/users/login	Login and get JWT
GET	/api/users/profile	Get user profile
PUT	/api/users/profile	Update user profile

📜 Detailed API Documentation
1️⃣ User Registration Endpoint: POST /api/users/register
Description: Registers a new user.
Request Body:

JSON

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "123 Street, City",
  "bio": "Software Developer",
  "profilePic": "[https://example.com/profile.jpg](https://example.com/profile.jpg)"
}

Response (Success 201 Created):

JSON

{
  "message": "User registered successfully!"
}
2️⃣ User Login Endpoint: POST /api/users/login
Description: Authenticates user and returns a JWT token.

Request Body:

JSON

{
  "email": "john@example.com",
  "password": "password123"
}
Response (Success 200 OK):

JSON

{
  "token": "your_jwt_token"
}
3️⃣ Get User Profile (Protected) Endpoint: GET /api/users/profile
Description: Retrieves the authenticated user's profile.

Headers:

JSON

{
  "Authorization": "Bearer your_jwt_token"
}
Response (Success 200 OK):

JSON

{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Street, City",
  "bio": "Software Developer",
  "profilePic": "[https://example.com/profile.jpg](https://example.com/profile.jpg)"
}
4️⃣ Update Profile (Protected) Endpoint: PUT /api/users/profile
Description: Updates user profile details.

Headers:

JSON

{
  "Authorization": "Bearer your_jwt_token"
}
Request Body: (Include only the fields you want to update)

JSON

{
  "name": "John Updated",
  "address": "456 New Street, City",
  "bio": "Senior Developer",
  "profilePic": "[https://example.com/new-profile.jpg]"
}
Response (Success 200 OK):

JSON

{
  "message": "User profile updated successfully!"
}
📜 License
This project is licensed under the MIT License.



```
