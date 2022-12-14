const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mbxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mbxToken })

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    //map over the files array and for each file, create an object
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
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

    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    
    if(req.body.deleteImages) {
        for(let file of req.body.deleteImages) {
            await cloudinary.uploader.destroy(file)
        }
        //pull out of the images array where the filename is contained withing the deleteImages array
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }

    await campground.save()
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