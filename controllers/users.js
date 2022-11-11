const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register') 
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if(err) return next(err)
            req.flash('success','welcome to yelp camp')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!')
    //if we were trying to get somewhere else besides the home page, redirect there
    const redirectUrl = req.session.returnTo || '/campgrounds'
    //delete the url that we were trying to go to
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req,res) => {
    req.logout(function(err) {
        if(err) {return next(err)}
        req.flash('success', 'Logged out')
        res.redirect('/campgrounds')
    })
}