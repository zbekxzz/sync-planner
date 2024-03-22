const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

function generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authenticateToken(req, res, next) {
    const token = req.cookies.jwt;
    
    if (token == null) return res.status(401).redirect("/logout");

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).redirect("/logout");
        req.userId = decoded.id;
        next();
    });
}

const app = express();
const port = 3000 || process.env.PORT;

const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Databse Connected Successfully!!");    
}).catch(err => {
    console.log('Could not connect to the database', err);
    process.exit();
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const UserModel = require('./models/user.js');
const UserRoute = require('./routes/User.js');
app.use('/api/user', UserRoute);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/pages/index.html"));
})

app.get('/profile', authenticateToken, (req, res) => {
    res.sendFile("pages/profile.html");
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/pages/register.html"));
})

app.get("/login", (req, res) => {
    res.sendFile("pages/login.html");
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserModel.findOne({ username });

        if ( !user ) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        if (bcrypt.compare(password, user.password, function(err, result) { return result })) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        
        const token = generateToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, path: '/' });
        res.json({ message: "You have successfully logged in. Reload page please" });
    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).json({ message: "Error occurred during login, please try again" });
    }
});

app.get("/confirmation/:id", async (req, res) => {
    const confirmCode = req.params.id;
    await UserModel.findOneAndUpdate({ confirmCode }, { confirmed: true }, { useFindAndModify: false }).then(data => {
        if (!data) {
            res.status(404).send(`User not found.`);
        }else{
            res.status(200).send("Registration confirmed successfully.")
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})

app.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});