const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')


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
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    await campground.save()
    req.flash('success', 'Successfully created new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// ******* SHOW SINGLE CAMPGROUND *******
router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id).populate({
        //populate all the reviews on the campground
        path:'reviews',
        //populate the author for the review
        populate: {
            path: 'author'
        }
        //populate the author of the campground
    }).populate('author')
    if(!campground){
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

// ******* SERVE EDIT FORM *******
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    //pull out the campground ID from the request
    const {id} = req.params
    //update that ID with the new request body
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    //if successful, flash a message
    req.flash('success', 'Successfully updated campground')
    //redirect to the newly created campground
    res.redirect(`/campgrounds/${campground._id}`) 
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}))

module.exports = router
