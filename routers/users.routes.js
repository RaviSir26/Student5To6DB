import express from 'express'
import dotEnv from 'dotenv';
import bcrypt from 'bcrypt';
import userModel from '../models/users.model.js';
const router = express.Router();
import jwt from 'jsonwebtoken';
dotEnv.config();


// Reigster API
router.post('/register', async (req, res) => {
    try {
        const { username, useremail, userpassword } = req.body;

        let existData = await userModel.findOne({ $or: [{ username }, { useremail }] });

        if (existData) return res.status(404).json({ message: 'Username and UserEmail already exist.' });

        let newPassword = await bcrypt.hash(userpassword, 10);

        let data = new userModel({ username, useremail, userpassword: newPassword });
        let result = await data.save();

        res.json(result);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login API
router.post('/login', async (req, res) => {
    try {
        const { useremail, userpassword } = req.body;

        let user = await userModel.findOne({ useremail });
        if (!user) return res.status(404).json("UserName Not Found");

        let password = await bcrypt.compare(userpassword, user.userpassword)
        if(!password) return res.status(404).json("Password Are Not Match");

        const jwtToken = jwt.sign(
            {userId: user._id, userName: user.username},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        )
        
        res.json({jwtToken});

    } catch (error) {

    }
});

// Logout API
router.post('/Logout', async (req, res) => {

});


export default router;