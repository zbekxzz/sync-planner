const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    profileImage: {
        type: String,
        default: 0
    },
    role: {
        type: String,
        required: true,
        default: "User"
    },
    email: {
        type: String,
        required: true
    },
    totalTasks: {
        type: Number,
        default: 0
    },
    totalPomodoro: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    confirmCode: {
        type: String,
        required: true
    }
});

const user = new mongoose.model('User', userSchema);
module.exports = user;