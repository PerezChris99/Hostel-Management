const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({
            msg: 'No token, authorization denied'
        });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, 'your-secret-key'); // Replace with your secret key

        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({
            msg: 'Token is not valid'
        });
    }
}

function adminAuth(req, res, next) {
    auth(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({
                msg: 'Admin access denied'
            });
        }
    });
}

module.exports = {
    auth,
    adminAuth
};