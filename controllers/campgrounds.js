const Campground = require('../models/campground')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    await campground.save()
    req.flash('success', 'Successfully created new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
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
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    //pull out the campground ID from the request
    const {id} = req.params
    //update that ID with the new request body
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    //if successful, flash a message
    req.flash('success', 'Successfully updated campground')
    //redirect to the newly created campground
    res.redirect(`/campgrounds/${campground._id}`) 
}

module.exports.deleteCampground = async(req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}