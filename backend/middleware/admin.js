/**
 * Middleware to check if a user has admin role
 * Should be used after the auth middleware
 */
module.exports = function(req, res, next) {
    // Check if user is an admin
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ msg: 'Admin access required' });
    }
};
