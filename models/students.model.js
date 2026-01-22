import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const studentSchema = new mongoose.Schema({
    _id: {
        type: Number,
        require: true,
        unique: true
    },
    student_name: {
        type: String,
        require: true
    },
    student_age: {
        type: Number,
        require: true
    },
    student_email: {
        type: String,
        require: true,
        unique: true
    },
    student_phone: {
        type: String,
        require: true
    },
    student_gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        require: true
    },
    student_photo: {
        type: String
    } 
});

studentSchema.plugin(mongoosePaginate);

const Student = mongoose.model(process.env.MONGODB_STUDENT_COLLECTION_NAME, studentSchema);

export default Student;