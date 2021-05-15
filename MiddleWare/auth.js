module.exports = {
    ensureAuth: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        } else {
            res.redirect('/')
        }
    },
    ensureGuest: function(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/dashboard');
        }
    },
    loginRequired: function(req, res, next) {

        if (req.username) {
            return next();
        }
        req.flash('error', 'Please Login First');
        return res.redirect('/n');
    }
}