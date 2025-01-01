import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { connectDB } from './config/db.js'
import userRoutes from './routes/user.js'
import cors from 'cors';

dotenv.config() // load envirenment variables

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// allow to parse json data
app.use(express.json()); 

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5174', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Routes
app.get('/', (req, res) => {
    res.send('Hello')
})
// user routes
app.use('/api/users', userRoutes);

// Server
app.listen(PORT, () => {
    connectDB();
    console.log('Server is running on http://localhost:' + PORT);
});
