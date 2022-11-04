module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        //this stores the URL that we were trying to hit
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you must be signed in')
        return res.redirect('/login')
    }
    next()
}
