const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const { campgroundSchema } = require('../schemas')
const {isLoggedIn} = require('../middleware')
const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// ******* CAMPGROUND INDEX *******
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

// ******* SERVE NEW FORM *******
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

// ******* NEW FORM ENDPOINT *******
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfully created new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// ******* SHOW SINGLE CAMPGROUND *******
router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id).populate('reviews')
    if(!campground){
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

// ******* SERVE EDIT FORM *******
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`) 
}))

router.delete('/:id', isLoggedIn, catchAsync(async(req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}))

module.exports = router
