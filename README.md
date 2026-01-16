# Folashade Adepoju Private Portfolio Archive

## Overview
A high-performance monorepo application designed for secure multimedia documentation and personal archiving. This project leverages a TypeScript-based architecture with a React 19 frontend and a robust Express.js backend integrated with Sequelize ORM for sophisticated data modeling and Cloudinary for cloud-based asset management.

## Features
- **Multimedia Management**: Support for seamless upload, storage, and retrieval of images, videos, and documents.
- **Admin Dashboard**: A secure, centralized interface for managing archive items, collections, and content visibility.
- **Drafting System**: An internal staging workflow allowing content to be saved privately before public transition.
- **Relational Architecture**: Sophisticated many-to-many relationships enabling items to exist within multiple curated collections.
- **Cloud Integration**: Direct integration with Cloudinary API for high-availability media hosting and streaming.
- **Dynamic Search & Filtering**: Real-time filtering by category, search terms, and metadata across the entire archive.

<!-- ## Getting Started
### Installation
1. Clone the repository and navigate to the project root.
2. Install dependencies for the server:
   ```bash
   cd server && npm install
   ```
3. Install dependencies for the client:
   ```bash
   cd ../client && npm install
   ```
4. Transpile TypeScript and initialize the database:
   ```bash
   cd ../server && npm run build
   npx sequelize-cli db:migrate
   ```

### Environment Variables
**Server (.env)**
```text
PORT=8000
DB_NAME=portfolio_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET_KEY=your_jwt_secret_phrase
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
**Client (.env)**
```text
VITE_BACKEND_URL=http://localhost:8000
``` -->

## API Documentation
### Base URL
`http://localhost:8000`

### Endpoints

#### POST /auth/signup
**Request**:
```json
{
  "userName": "admin_user",
  "password": "securePassword123"
}
```
**Response**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-v4-string",
    "userName": "admin_user",
    "userType": "admin"
  }
}
```
**Errors**:
- 400: Missing required fields or password too short
- 500: Internal server error during user creation

#### POST /auth/login
**Request**:
```json
{
  "userName": "admin_user",
  "password": "securePassword123"
}
```
**Response**:
```json
{
  "message": "Login successful",
  "token": "jwt_access_token_string",
  "user": {
    "id": "uuid-v4-string",
    "userName": "admin_user",
    "userType": "admin"
  }
}
```
**Errors**:
- 401: Invalid credentials
- 404: User not found

#### GET /archive-items
**Request**:
Query Parameters: `categoryId` (optional), `search` (optional)
**Response**:
```json
[
  {
    "id": "uuid-v4",
    "title": "Climate Action Report",
    "description": "2024 environmental study",
    "mediaType": "document",
    "visibility": "public",
    "cloudServiceUrl": "https://cloudinary.com/..."
  }
]
```
**Errors**:
- 404: No items found matching criteria

#### POST /archive-items/upload
**Request**:
Content-Type: `multipart/form-data`
Fields: `title`, `description`, `CategoryId`, `visibility`, `isOnTheMainPage`, `media` (File)
**Response**:
```json
{
  "message": "Item uploaded successfully as archive",
  "item": { "id": "uuid", "title": "Example", "cloudServiceUrl": "..." },
  "savedTo": "Archives"
}
```
**Errors**:
- 400: Media file is required or duplicate title
- 401: Unauthorized access

#### GET /archive-items/:id
**Request**:
Path parameter: `id`
**Response**:
```json
{
  "item": {
    "id": "uuid",
    "title": "Title",
    "Collections": [{ "id": "uuid", "name": "Collection A" }],
    "Category": { "id": "uuid", "name": "Educational" }
  }
}
```
**Errors**:
- 404: Archive item not found

#### PUT /archive-items/:id
**Request**:
Content-Type: `multipart/form-data`
Fields: `title`, `description`, `addCollectionIds` (Array), `removeCollectionIds` (Array), `media` (Optional File)
**Response**:
```json
{
  "message": "Archive item updated successfully",
  "item": { ...updatedObject }
}
```
**Errors**:
- 404: Item not found
- 401: Invalid token

#### DELETE /archive-items/:id
**Request**:
Authorization Header required
**Response**:
```json
{
  "message": "Archive item deleted successfully"
}
```

#### GET /collections
**Request**:
Query Parameters: `search` (optional)
**Response**:
```json
{
  "count": 5,
  "collections": [
    {
      "id": "uuid",
      "name": "Social Work",
      "itemCount": 12
    }
  ]
}
```

#### POST /collections/create
**Request**:
```json
{
  "name": "Featured Series",
  "description": "Primary works for 2025",
  "archiveIds": ["uuid-1", "uuid-2"]
}
```
**Response**:
```json
{
  "message": "Collection created successfully",
  "collection": { "id": "uuid", "name": "Featured Series" }
}
```

#### GET /drafts
**Request**:
Authorization Header required
**Response**:
```json
{
  "count": 2,
  "drafts": [{ "id": "uuid", "title": "In-Progress Work" }]
}
```

#### POST /drafts/:id/publish
**Request**:
Authorization Header required
**Response**:
```json
{
  "message": "Draft published successfully",
  "item": { "id": "uuid", "visibility": "public" }
}
```

## Technologies Used

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [React 19](https://react.dev/) | Component-based UI Architecture |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first responsive design |
| **Backend** | [Node.js](https://nodejs.org/) | Runtime Environment |
| **Server** | [Express.js](https://expressjs.com/) | Web API Framework |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational Data Storage |
| **ORM** | [Sequelize](https://sequelize.org/) | Database Mapping and Migrations |
| **Storage** | [Cloudinary](https://cloudinary.com/) | Cloud Asset Management |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe Development |

## Usage
The application is split into a Public View and an Administrative Dashboard.

1. **Public Archives**: Users can browse all published items, view metadata, and open documents/videos directly.
2. **Search**: Utilize the centralized search bar to query archives and collections simultaneously.
3. **Admin Dashboard**: Accessed via `/auth/login`. This portal allows the administrator to:
   - Upload new media (Images, Videos, PDFs).
   - Manage "Drafts" to review content before public release.
   - Group existing archive items into "Collections" for curated viewing.
   - Edit existing metadata and feature items on the home hero section.

## License
This project is licensed under the ISC License.

## Author Info
**Temitope Alawode**
- GitHub: [https://github.com/TemitopeAlawode]
- LinkedIn: [https://www.linkedin.com/in/temitope-alawode]
- Portfolio: [https://temitopealawode.vercel.app/]

---

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)