const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const logger = require('morgan')
const bcrypt = require('bcrypt')
const expressSession = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local')
const config = require('./utils/config')
const User = require('./models/user')


mongoose.connect(config.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
  .then(() => console.log('connected to MongoDB'))
  .catch(err => console.log('error connecting to MongoDB:', err.message))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(expressSession({
  secret: config.SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy({
  usernameField: "email",
  passwordField: "password"
}, (email, password, next) => {
  User.findOne({
    email: email
  }, (err, user) => {
    if (err) return next(err)
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return next({message: "Email or password incorrect"})
    }
    next(null, user)
  })
}))

passport.serializeUser((user, next) => {
  next(null, user._id)
})

passport.deserializeUser(function(id, next) {
  User.findById(id, function(err, user) {
      next(err, user);
  });
});

app.get('/', (req, res) => {
  res.render('index', {title: 'SaaS Project'})
})

app.get('/main', (req, res, next) => {
  res.render('main')
})

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login-page'}),
  (req, res) => {
    res.redirect('/main')
  }
)

app.get('/login-page', (req, res, next) => {
  res.render('login-page')
})

app.post('/signup', (req, res, next) => {
  User.findOne({
    email: req.body.email
  }, (err, user) => {
    if (err) return next(err)
    if (user) return next({ message: 'User already exists' })

    let newUser = new User({
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10)
    })
  
    newUser.save(err => {
      if (err) return next(err)
      res.redirect('/main')
    })
  })
})

let sawWalktrough;

app.get('/walktrough', (req, res, next) => {
  req.session.sawWalktrough = true
  res.end()
})

app.get('/complicated', (req, res, next) => {
  console.log(req.session.sawWalktrough)
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  
  res.status(err.state || 500)
  res.render('error')
})

module.exports = app