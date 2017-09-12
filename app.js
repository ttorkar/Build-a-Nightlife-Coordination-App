const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const connectMongo = require('connect-mongo')
const dotenv = require('dotenv')
const helmet = require('helmet')

const routes = require('./routes')

const MongoStore = connectMongo(session)

const app = express()

app.use(helmet())

dotenv.config()
require('./auth/passport')(passport)

mongoose.connect(process.env.MONGO_URI)
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on('error', console.error.bind(console, 'Mongo connection error: '))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())

app.use(session({
  secret:'secret',
  resave: false,
  saveUnitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection}),
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/', routes)

app.use((req, res, next) => {
  const err = new Error('Page Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err: {},

  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
