const mongoose = require('mongoose')
const db = mongoose.connection
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

// ******* MONGO CONNECTION *******
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log('database connected')
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async() => {
    await Campground.deleteMany({})
    for(let i=0; i<50;i++){
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '636463952b97ae1037a28e88',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dbxmzayi3/image/upload/v1668660365/Yelp-Camp/ogqfogggvyafhqsn58bk.jpg',
                  filename: 'Yelp-Camp/ogqfogggvyafhqsn58bk',
                },
                {
                  url: 'https://res.cloudinary.com/dbxmzayi3/image/upload/v1668660366/Yelp-Camp/nmgjhfhynm5xujgonkvs.png',
                  filename: 'Yelp-Camp/nmgjhfhynm5xujgonkvs',
                },
                {
                  url: 'https://res.cloudinary.com/dbxmzayi3/image/upload/v1668660366/Yelp-Camp/flqb3palchtp75skrsjl.png',
                  filename: 'Yelp-Camp/flqb3palchtp75skrsjl',
                }
              ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            price
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})