const { campgroundSchema, reviewSchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        //this stores the URL that we were trying to hit
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you must be signed in')
        return res.redirect('/login')
    }
    next()
}

module.exports.validateCampground = (req, res, next) => {
    //this checks if the req.body is valids against the campgroundSchema
    const {error} = campgroundSchema.validate(req.body)
    //if there is an error in validation
    if(error){
        //save the message and throw a new error
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        //otherwise move on
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    //pull out the campground id from the req.params
    const {id} = req.params
    //find a matching campground
    const campground = await Campground.findById(id)
    //check if the logged in user matches the campground author
    if(!campground.author._id.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${campground.id}`)
    }
    //otherwise, move on
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    //pull out the campground id from the req.params
    const { id, reviewId } = req.params
    //find a matching campground
    const review = await Review.findById(reviewId)
    //check if the logged in user matches the campground author
    if(!review.author._id.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    //otherwise, move on
    next()
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
