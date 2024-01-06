class IsAdminMiddlware {
    isAdmin(req, res, next) {
        if (req.user.role == "Admin") {
            next();
        } else {
            res.status(403).json({
                message: "You are not authorized"
            });
        }
    }
}
module.exports = new IsAdminMiddlware();