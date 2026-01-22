import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import studentModel from '../models/students.model.js';


const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        let newFile = Date.now() + path.extname(file.originalname);
        cb(null, newFile);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    }
    else {
        cb(new Error('Only images are allowed!'), false)
    }
};

const upload = multer({
    storage: Storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 100 }
});


// 6 Pagination Api
router.get('/page', async (req, res) => {
    try {
        const { page = 1, limit = 2 } = req.query;
        const skip = (page - 1) * limit;

        // const totalData = await studentModel.countDocuments();

        const data = await studentModel.find().skip(skip).limit(Number(limit));

        res.json({
            // totalData,
            // totalPages: Math.ceil(totalData / limit),
            // currentPage: Number(page),
            // limit: Number(limit),
            data
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 1 Read All Data API
router.get('/', async (req, res) => {
    try {
        let data = await studentModel.find(req.body);
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2 Read One Data API
router.get('/:id', async (req, res) => {
    try {
        let data = await studentModel.findById(req.params.id);
        if (!data) res.status(404).json({ message: "Student Data Not Found" })
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Add New Student Data
router.post('/', upload.single('student_photo'), async (req, res) => {
    try {
        if (req.file) {
            req.body.student_photo = req.file.filename;
        }

        const student = await studentModel.create(req.body);

        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});


// 3 update Data API
router.put('/:_id', upload.single('student_photo'), async (req, res) => {
    try {
        let existingStudent = await studentModel.findById(req.params._id);

        // duplicate Image Remove Code
        if (!existingStudent) {
            if (req.file.filename) {
                const filePath = path.join('./uploads', req.file.filename)
                fs.unlink(filePath, (err) => {
                    if (err) console.log('Failed to Delete image: ', err);
                })
            }
            return res.status(404).json({ message: "Student Data Not Found" });
        }

        // Image Update
        if (req.file) {
            if (existingStudent.student_photo) {
                let oldFilePath = path.join('./uploads', existingStudent.student_photo);
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.log('Failed To Image Update...', err);
                })
            }
            req.body.student_photo = req.file.filename;
        }

        let data = await studentModel.findByIdAndUpdate(req.params._id, req.body, { new: true });
        if (!data) return res.status(404).json({ message: "Student Data Not Found" });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4 Delete Data API
router.delete('/:_id', async (req, res) => {
    try {
        let data = await studentModel.findByIdAndDelete(req.params._id);
        if (!data) return res.status(404).json({ message: "Student Data Not Found" });

        if (data.student_photo) {
            let oldFilePath = path.join('./uploads', data.student_photo);
            fs.unlink(oldFilePath, (err) => {
                if (err) console.log('Failed To Image Update...', err);
            });
        }
        // res.json(data);
        res.json({ message: "Student Deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5 Search Data API
router.get('/search/:key', async (req, res) => {
    try {
        const key = req.params.key;

        const searchCon = [
            { student_name: { $regex: key, $options: 'i' } },
            { student_email: { $regex: key, $options: 'i' } }
        ]

        if (!isNaN(key)) {
            searchCon.push({ $or: [{ student_age: Number(key) }, { _id: Number(key) }] })
        }

        let data = await studentModel.find({
            $or: searchCon
        });

        if (data.length === 0) {
            return res.status(404).json({ message: "Student Not Found" });
        }
        res.json(data);


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;
