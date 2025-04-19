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

const corsOptions1 = {
  origin: 'http://77.255.162.181:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

const corsOptions2 = {
  origin: 'http://77.255.162.181:8080',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

const corsOptions3 = {
  origin: 'http://77.255.162.181:3030',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use((req, res, next) => {
  const origin = req.header('Origin');

  if (origin === 'http://77.255.162.181:5173') {
    return cors(corsOptions1)(req, res, next);
  } else if (origin === 'http://77.255.162.181:8080') {
    return cors(corsOptions2)(req, res, next);
  } else if (origin === 'http://77.255.162.181:3030') {
    return cors(corsOptions3)(req, res, next);
  } else {
    res.status(403).json({
      success: false,
      user_message: "Permission denied, you don't have authorization to use users api",
      message: "Permission denied, you don't have authorization to use users api",
    });
  }
});


// user routes
app.use('/api/users', userRoutes);

// Server
app.listen(PORT, () => {
    connectDB();
    console.log('Server is running');
});
