const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')
//CAMPGROUND SCHEMA
const CampgroundSchema = new Schema({
    title: String,
    image: String,
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