# Portfolio Website Backend API 🌐

## Overview
This project serves as the robust backend API for a private portfolio website, built with **Node.js** and **TypeScript**. It leverages **Express.js** for handling HTTP requests, **Sequelize** as an ORM for **PostgreSQL** database interactions, and **Cloudinary** for scalable media storage.

## Features
*   **User Authentication**: Secure user registration and login for administrative access, utilizing `bcrypt` for password hashing and `jsonwebtoken` for secure session management.
*   **Archive Item Management**: Comprehensive API for creating, viewing, and managing portfolio items, supporting various media types (images, videos, documents).
*   **Draft Functionality**: Allows saving portfolio items as private drafts before making them public.
*   **Category Management**: Organize portfolio items efficiently with a dedicated system for creating, retrieving, and assigning categories.
*   **Cloud-based Media Storage**: Seamless integration with Cloudinary for reliable and efficient storage of uploaded media files.
*   **Flexible Data Filtering**: Retrieve archive items based on category or search queries for enhanced content discoverability.
*   **Scalable Database**: Utilizes PostgreSQL for persistent data storage, managed through Sequelize ORM.

## Getting Started
To set up and run the Portfolio Website Backend API locally, follow these steps.

### Installation
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/VishTech-Integrated-Innovation-LTD/privateportfoliowebsite.git
    cd privateportfoliowebsite/server
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Build TypeScript Files**:
    ```bash
    npm run build
    ```

### Environment Variables
Create a `.env` file in the `server/` directory and populate it with the following required variables. Examples are provided for clarity.

```env
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET_KEY=a_strong_secret_key_for_jwt_signing
```

**Note on Database Setup**: Ensure you have a PostgreSQL database running and accessible with the credentials provided in your `.env` file. If using `sequelize-cli` migrations, run them after setting up your `.env`:
```bash
npx sequelize-cli db:migrate
```

### Running the Server
*   **Development Mode (with Nodemon)**:
    ```bash
    npm run server
    ```
*   **Production Mode (after building)**:
    ```bash
    npm start
    ```
    The server will start on the port specified in your `.env` file (defaulting to 8000).

## API Documentation
The API provides several endpoints for managing user authentication, archive items, and categories.

### Base URL
`http://localhost:8000` (or your configured `PORT`)

### Endpoints

#### POST /auth/signup
Registers a new administrator user.

**Request**:
```json
{
  "userName": "adminuser",
  "password": "StrongPassword123"
}
```

**Response**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "a-uuid-string",
    "userName": "adminuser",
    "userType": "admin",
    "updatedAt": "2023-10-27T10:00:00.000Z",
    "createdAt": "2023-10-27T10:00:00.000Z"
  }
}
```

**Errors**:
*   `400 Bad Request`: Missing fields, invalid data types, password too short (min 8 characters).
*   `500 Internal Server Error`: Error creating user.

#### POST /auth/login
Authenticates an administrator user and returns a JWT.

**Request**:
```json
{
  "userName": "adminuser",
  "password": "StrongPassword123"
}
```

**Response**:
```json
{
  "message": "Login/Signin successful",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "a-uuid-string",
    "userName": "adminuser",
    "userType": "admin"
  }
}
```

**Errors**:
*   `400 Bad Request`: Missing username or password.
*   `404 Not Found`: User not found.
*   `401 Unauthorized`: Invalid password.
*   `500 Internal Server Error`: Error signing in user.

#### POST /archive-items/upload
Uploads a new archive item (image, video, or document) to Cloudinary and saves its metadata. Requires `Content-Type: multipart/form-data`.

**Request**:
```
{
  "title": "My Project Showcase",
  "description": "A detailed description of my project.",
  "CategoryId": "a-category-uuid",
  "visibility": "public", // or "private" to save as a draft
  "isOnTheMainPage": true, // boolean
  "media": "[FILE_UPLOAD_HERE]" // The actual media file (image, video, or document)
}
```

**Response**:
```json
{
  "message": "Item uploaded successfully as archive",
  "item": {
    "id": "a-uuid-string",
    "title": "My Project Showcase",
    "description": "A detailed description of my project.",
    "CategoryId": "a-category-uuid",
    "mediaType": "image",
    "visibility": "public",
    "isOnTheMainPage": true,
    "cloudServiceUrl": "https://res.cloudinary.com/...",
    "updatedAt": "2023-10-27T10:00:00.000Z",
    "createdAt": "2023-10-27T10:00:00.000Z"
  },
  "savedTo": "Archives"
}
```

**Errors**:
*   `400 Bad Request`: Media file is required, validation errors.
*   `500 Internal Server Error`: Error uploading item.

#### GET /archive-items
Retrieves a list of public archive items. Can be filtered by category or search query.

**Request**:
Query Parameters:
*   `categoryId`: (Optional) UUID of the category to filter by.
*   `search`: (Optional) String to search within archive item titles (case-insensitive).

Example: `GET /archive-items?categoryId=some-uuid-value&search=project`

**Response**:
```json
[
  {
    "id": "a-uuid-string",
    "title": "My Project Showcase",
    "description": "A detailed description of my project.",
    "CategoryId": "a-category-uuid",
    "mediaType": "image",
    "visibility": "public",
    "isOnTheMainPage": true,
    "cloudServiceUrl": "https://res.cloudinary.com/...",
    "createdAt": "2023-10-27T10:00:00.000Z",
    "updatedAt": "2023-10-27T10:00:00.000Z"
  },
  {
    "id": "another-uuid-string",
    "title": "Another Awesome Project",
    "description": "More project details...",
    "CategoryId": "a-category-uuid",
    "mediaType": "video",
    "visibility": "public",
    "isOnTheMainPage": false,
    "cloudServiceUrl": "https://res.cloudinary.com/...",
    "createdAt": "2023-10-27T10:05:00.000Z",
    "updatedAt": "2023-10-27T10:05:00.000Z"
  }
]
```

**Errors**:
*   `400 Bad Request`: Invalid `categoryId` or `search` query parameter format.
*   `404 Not Found`: No archives/archive items found matching the criteria.
*   `500 Internal Server Error`: Error fetching archive items.

#### POST /categories/add-category
Creates a new category for organizing archive items.

**Request**:
```json
{
  "name": "Web Development",
  "description": "Projects related to front-end and back-end web development."
}
```

**Response**:
```json
{
  "message": "Category created successfully",
  "category": {
    "id": "a-uuid-string",
    "name": "Web Development",
    "description": "Projects related to front-end and back-end web development.",
    "updatedAt": "2023-10-27T10:00:00.000Z",
    "createdAt": "2023-10-27T10:00:00.000Z"
  }
}
```

**Errors**:
*   `400 Bad Request`: Missing name or description, invalid data types, category already exists.
*   `500 Internal Server Error`: Error creating category.

#### GET /categories
Retrieves all available categories.

**Request**:
None.

**Response**:
```json
[
  {
    "id": "category-uuid-1",
    "name": "Web Development",
    "description": "Projects related to front-end and back-end web development.",
    "createdAt": "2023-10-27T10:00:00.000Z",
    "updatedAt": "2023-10-27T10:00:00.000Z"
  },
  {
    "id": "category-uuid-2",
    "name": "Mobile Apps",
    "description": "Projects for iOS and Android platforms.",
    "createdAt": "2023-10-27T10:05:00.000Z",
    "updatedAt": "2023-10-27T10:05:00.000Z"
  }
]
```

**Errors**:
*   `500 Internal Server Error`: Error fetching categories.

#### GET /categories/:id
Retrieves a single category by its ID.

**Request**:
Path Parameter:
*   `id`: UUID of the category.

Example: `GET /categories/category-uuid-1`

**Response**:
```json
{
  "id": "category-uuid-1",
  "name": "Web Development",
  "description": "Projects related to front-end and back-end web development.",
  "createdAt": "2023-10-27T10:00:00.000Z",
  "updatedAt": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
*   `404 Not Found`: Category not found.
*   `500 Internal Server Error`: Error fetching category.

#### POST /collections/create
Creates a new collection. This endpoint's controller is currently under development.

**Request**:
```json
{
  "name": "Featured Projects",
  "description": "A curated collection of top projects.",
  "ArchiveId": "an-archive-item-uuid"
}
```

**Response**:
(Response structure not yet defined as the controller is incomplete)

**Errors**:
*   `500 Internal Server Error`: Error creating a collection.

## Usage
Interact with the API using tools like Postman, Insomnia, or cURL.

1.  **Register a User**: First, create an admin account.
    ```bash
    curl -X POST -H "Content-Type: application/json" \
         -d '{"userName": "myadmin", "password": "securepassword123"}' \
         http://localhost:8000/auth/signup
    ```

2.  **Login and Get a Token**: Use the registered credentials to obtain an authentication token.
    ```bash
    curl -X POST -H "Content-Type: application/json" \
         -d '{"userName": "myadmin", "password": "securepassword123"}' \
         http://localhost:8000/auth/login
    ```
    Save the `token` from the response.

3.  **Create a Category**: (Requires authentication)
    ```bash
    curl -X POST -H "Content-Type: application/json" \
         -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
         -d '{"name": "Photography", "description": "My photography portfolio."}' \
         http://localhost:8000/categories/add-category
    ```

4.  **Upload an Archive Item**: (Requires authentication and `multipart/form-data`)
    ```bash
    curl -X POST -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
         -F "title=Sunset Photo" \
         -F "description=A beautiful sunset over the mountains." \
         -F "CategoryId=YOUR_CATEGORY_UUID" \
         -F "visibility=public" \
         -F "isOnTheMainPage=true" \
         -F "media=@/path/to/your/image.jpg" \
         http://localhost:8000/archive-items/upload
    ```

5.  **Fetch Archive Items**: (No authentication required for public items)
    ```bash
    curl -X GET http://localhost:8000/archive-items?search=photo
    ```

## Technologies Used
| Technology         | Description                                     | Link                                                            |
| :----------------- | :---------------------------------------------- | :-------------------------------------------------------------- |
| **Node.js**        | JavaScript runtime environment                  | [Node.js](https://nodejs.org/en/)                               |
| **TypeScript**     | Superset of JavaScript with static typing       | [TypeScript](https://www.typescriptlang.org/)                   |
| **Express.js**     | Web framework for Node.js                       | [Express.js](https://expressjs.com/)                            |
| **PostgreSQL**     | Powerful open-source relational database        | [PostgreSQL](https://www.postgresql.org/)                       |
| **Sequelize**      | Object-Relational Mapper (ORM) for Node.js      | [Sequelize](https://sequelize.org/)                             |
| **Cloudinary**     | Cloud-based image and video management          | [Cloudinary](https://cloudinary.com/)                           |
| **Multer**         | Node.js middleware for handling `multipart/form-data` | [Multer](https://github.com/expressjs/multer)                   |
| **Bcrypt**         | Library for hashing passwords                   | [Bcrypt.js](https://www.npmjs.com/package/bcrypt)               |
| **JSON Web Token** | Standard for securely transmitting information  | [JWT](https://jwt.io/)                                          |
| **Nodemon**        | Utility for automatic server restarts in development | [Nodemon](https://nodemon.io/)                                  |

## Author Info
**Temitope Alawode**
*   LinkedIn: [www.linkedin.com/in/temitope-alawode]
(www.linkedin.com/in/temitope-alawode)


##
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blueviolet?logo=postgresql)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-blue?logo=sequelize)](https://sequelize.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-SDK-orange?logo=cloudinary)](https://cloudinary.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)