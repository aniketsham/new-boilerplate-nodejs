import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/connect-db';
import userRouter from './routes/user-route';
import adminRouter from './routes/admin-route';
import superadminRouter from './routes/superadmin-route';
import cors from "cors"

const app = express();
dotenv.config();
const PORT = process.env.PORT;
connectDB();

// Configure CORS
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  
}));

app.get('/', (req, res) => {
  res.send('Hello NodeJS Boilerplate');
});

app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/superadmin', superadminRouter);
app.use('/api/admin', adminRouter);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
