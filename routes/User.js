const express = require('express'); 
const jwt = require('jsonwebtoken');
const UserController = require('../controllers/User');
const router = express.Router();

function authenticateToken(req, res, next) {
    const token = req.cookies.jwt;
    
    if (token == null) return res.status(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        console.log(err)
        if (err) return res.status(403).redirect("/logout");
        req.userId = decoded.id;
        console.log("heello")
        next();
    });
}

router.get('/', UserController.findAll);
router.get('/:id', authenticateToken, UserController.findOne);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.destroy);

module.exports = router;