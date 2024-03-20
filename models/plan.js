const mongoose = require('mongoose');
const planSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true
    },
    task: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    }
});

const plan = new mongoose.model('Plan', planSchema);
module.exports = plan;