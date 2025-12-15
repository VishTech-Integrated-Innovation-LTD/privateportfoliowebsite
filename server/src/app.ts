// Importing express
import express from 'express';

// Importing dotenv to load env variables
import dotenv from 'dotenv';

// Loads .env file contents into process.env
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware to parse incoming JSON requests (For communication using json in the server)
app.use(express.json());


// Importing Routes
import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/archiveItemRoutes';
import categoryRoutes from './routes/categoryRoutes';



// Routes
app.use('/auth', userRoutes);
app.use('/archive-items', itemRoutes);
app.use('/categories', categoryRoutes);


// Export app
export default app;