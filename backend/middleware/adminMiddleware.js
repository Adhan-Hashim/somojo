// middleware/adminMiddleware.js
// Must be used AFTER authMiddleware
module.exports = function (req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};
