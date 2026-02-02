import express from 'express';
import { ConnectDB } from './config/ConnectDB.js';
import path from 'path';
import studentRouter from './routers/student.routes.js';
import userRouter from './routers/users.routes.js';
import userAuth from './middleware/userJwtAuth.js';
import { MulterError } from 'multer';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

ConnectDB();

const limiter = rateLimit({
    windowMs: 1000 * 60,
    max: 6,
    message: "Too many request from this IP, please try again later."
});

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use('/uploads', express.static(path.join(import.meta.dirname, 'uploads')));

app.use(limiter);
app.use('/users', userRouter);
// app.use(userAuth);
app.use('/students', userAuth, studentRouter);

// Multer Middleware
app.use((error, req, res, next)=>{
    if(error instanceof MulterError){
        return res.status(400).json(`Iamge Error: ${error.message} ${error.code}`);
    }else if(error){
        return res.status(500).json(`Something went wrong:${error.message} `);
    }
    next();
});

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server Will be Started ${PORT} Port.`);
});