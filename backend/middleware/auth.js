const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Access the token from req.cookies.token
    const token = req.cookies.token;
    console.log("token",token)

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = user; // Attach user info to request
        console.log("user",req.user)
        next();
    });

};
const authenticateToken1 = (req, res, next) => {
    next();
}
module.exports = authenticateToken;
