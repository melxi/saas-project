const express = require('express')
const path = require('path')
const app = express()
const logger = require('morgan')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.render('index', {title: 'SaaS Project'})
})

app.post('/signup', (req, res, next) => {
  debugger
  console.log('body', req.body)
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  
  res.status(err.state || 500)
  res.render('error')
})

module.exports = app