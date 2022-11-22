const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')
//CAMPGROUND SCHEMA

const ImageSchema = new Schema({
    url: String,
    filename: String
})
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum:['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

//Remove reviews upon campground deletion
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        await Review.deleteMany({
            //if Review ID is in reviews array
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//EXPORT SCHEMA As CAMPGROUND
module.exports = mongoose.model('Campground', CampgroundSchema)