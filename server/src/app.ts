// Importing express
import express from 'express';

// Importing cors for handling Cross-Origin Resource Sharing
import cors from 'cors';

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
import collectionRoutes from './routes/collectionRoutes';
import draftRoutes from './routes/draftRoutes';



// CORS options that allows to accept specific methods from a particular domain
const corsOptions = {
  // origin: "http://localhost:5173",
  origin: `${process.env.VITE_FRONTEND_URL}`,
  methods: ["POST", "GET", "PUT", "DELETE"],
};

// Enable CORS
app.use(cors(corsOptions));



// Routes
app.use('/auth', userRoutes);
app.use('/archive-items', itemRoutes);
app.use('/categories', categoryRoutes);
app.use('/collections', collectionRoutes);
app.use('/drafts', draftRoutes);



// Export app
export default app;