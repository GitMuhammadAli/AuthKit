# Auth-kit

The Auth-kit project is a Node.js application for user authentication using third-party providers like Google and Facebook. It supports persistent sessions and integrates with MongoDB to store user information.

## Features

- User authentication with Google and Facebook.
- Secure session handling with cookies.
- User data storage in MongoDB.
- Middleware for route protection based on user roles.
- Responsive design for login and signup pages.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```sh
   git clone https://github.com/GitMuhammadAli/AuthKit.git
   cd AuthKit
2. **nstall dependencies:**
   ```sh
   npm install
3. **Set up environment variables:**
   ```sh
   SESSION_SECRET=Secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_CLIENT_ID=your_facebook_client_id
   FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
   DB_URL=mongodb://localhost:27017/AuthKit
   OPEN_ROUTE_APIKEY=your_open_route_api_key
   JWT_EXPIRES_IN=24h
   MAILTRAP_USER=your_mailtrap_user
   MAILTRAP_PASS=your_mailtrap_pass
   JWT_API_SECRET_KEY=your_jwt_api_secret_key
   COOKIE_KEY=YourCookieKey
   COOKIE_MAX_AGE=7d
4. **Run the application:**
   ```sh
   npm start

   
## Technologies

- Node.js: JavaScript runtime for the backend.
- Express: Web framework for Node.js.
- MongoDB: NoSQL database for storing user data.
- Passport.js: Authentication middleware for Node.js.
- EJS: Templating engine for rendering views.
- Bootstrap: CSS framework for responsive design.




## Usage
After running the application, you can access the following routes

- /auth/signin: Sign in page
- /auth/signup: Sign up page
- /auth/google: Google login
- /auth/facebook: Facebook login
- /: Home page (requires authentication)
- /admin: Admin page (requires admin role)
   

## Register , Login , Forget , Reset
https://github.com/GitMuhammadAli/AuthKit/assets/135626772/c999eda9-18c1-4604-8e3f-6ac7b2ab82d0


## Google-Login
https://github.com/GitMuhammadAli/AuthKit/assets/135626772/3b24bd98-1cc8-486e-b519-052a89e6a0f9



