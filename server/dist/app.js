"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express
const express_1 = __importDefault(require("express"));
// Importing cors for handling Cross-Origin Resource Sharing
const cors_1 = __importDefault(require("cors"));
// Importing dotenv to load env variables
const dotenv_1 = __importDefault(require("dotenv"));
// Loads .env file contents into process.env
dotenv_1.default.config();
// Initialize the Express application
const app = (0, express_1.default)();
// Middleware to parse incoming JSON requests (For communication using json in the server)
app.use(express_1.default.json());
// Importing Routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const archiveItemRoutes_1 = __importDefault(require("./routes/archiveItemRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const collectionRoutes_1 = __importDefault(require("./routes/collectionRoutes"));
const draftRoutes_1 = __importDefault(require("./routes/draftRoutes"));
// CORS options that allows to accept specific methods from a particular domain
const corsOptions = {
    origin: "http://localhost:5173",
    //   origin: `${process.env.VITE_FRONTEND_URL}`,
    methods: ["POST", "GET", "PUT", "DELETE"],
};
// Enable CORS
app.use((0, cors_1.default)(corsOptions));
// Routes
app.use('/auth', userRoutes_1.default);
app.use('/archive-items', archiveItemRoutes_1.default);
app.use('/categories', categoryRoutes_1.default);
app.use('/collections', collectionRoutes_1.default);
app.use('/drafts', draftRoutes_1.default);
// Export app
exports.default = app;
