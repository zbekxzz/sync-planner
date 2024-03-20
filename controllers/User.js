const bcrypt = require('bcryptjs');
const mailSender = require('../mail/mailSender.js')

function generateConfirmationCode() {
    let code = '';
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const codeLength = 25;

    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
}

const UserModel = require('../models/user');
// Create and Save a new user
exports.create = async (req, res) => {
    const { username, email, password } = req.body;

    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
    const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!username && !email && !password) {
        return res.status(400).send({ message: "Content can not be empty!" });
    }

    if (username.length < 5) {
        return res.status(400).json({ message: "Username must contain at least 5 chars" });
    } else if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please, write valid email address" });
    } else if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password must contain at least 8 chars, 1 symbol and 1 letter in uppercase" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmCode = generateConfirmationCode()
    
    const user = new UserModel({
        username,
        email,
        password: hashedPassword,
        confirmCode
    });
    
    await user.save().then(data => {
        mailSender.sendMail(confirmCode, email);
        return res.json({ message: "You are successfully registered a new account" });
    }).catch(err => {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Username already exists" })
        }
        return res.status(500).json({
            message: err.message || "Some error occurred while creating user"
        });
    });
};

// Retrieve all users from the database.
exports.findAll = async (req, res) => {
    try {
        const user = await UserModel.find();
        res.status(200).json(user);
    } catch(error) {
        res.status(404).json({message: error.message});
    }
};

// Find a single User with an id
exports.findOne = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        console.log(user);
        res.status(200).json(user);
    } catch(error) {
        res.status(404).json({ message: error.message});
    }
};

// Update a user by the id in the request
exports.update = async (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }
    
    const id = req.params.id;
    
    await UserModel.findByIdAndUpdate(id, req.body, { useFindAndModify: false }).then(data => {
        if (!data) {
            res.status(404).send({
                message: `User not found.`
            });
        }else{
            res.status(200).json({ message: "User updated successfully." })
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

// Delete a user with the specified id in the request
exports.destroy = async (req, res) => {
    await UserModel.findByIdAndRemove(req.params.id).then(data => {
        if (!data) {
          res.status(404).send({
            message: `User not found.`
          });
        } else {
          res.send({
            message: "User deleted successfully!"
          });
        }
    }).catch(err => {
        res.status(500).send({
          message: err.message
        });
    });
};

exports.confirm = async (req, res) => {

}