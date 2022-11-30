//if we're in dev
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const db = mongoose.connection
const session = require('express-session')
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')


//requiring routes
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

// ******* MONGO CONNECTION *******
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})


db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log('database connected')
})


// ******* MIDDLEWARE *******
app.engine('ejs', ejsMate)

//setting EJS as the templating engine
app.set('view engine', 'ejs')

//set the views directory to the file path + views folder
app.set('views', path.join(__dirname, 'views'))

//parse request.body so that it is not blank
app.use(express.urlencoded({extended: true}))

//lets us override default post method on forms
app.use(methodOverride('_method'))

//setting the public directory which will hold all stylesheets and scripts
app.use(express.static(path.join(__dirname, 'public')))

app.use(mongoSanitize())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbxmzayi3/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//express-session setup
const sessionConfig = {
    name: 'yelp-cookie',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        //expires in a week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())

//initialize the authentication module
app.use(passport.initialize())
//alter the req object and change the 'user' value into the deserialized user object
app.use(passport.session())
//use authenticate method from the User model (passport-local-mongoose)
passport.use(new LocalStrategy(User.authenticate()))
//tells passport how to store a user in the session
passport.serializeUser(User.serializeUser())
//tells passport how to retreive a user in the session
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})

// ******* ROUTES *******
//using the campground and reviews routes on the specificed listeners
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)
app.get('/', (req, res) => {
    res.render('home')
})

//all routes, a catch all
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//upon error, render the error template
app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', { err })
})

// ******* ACTIVATE PORT *******
app.listen(5000, () => {
    console.log('listening on port 5000')
})