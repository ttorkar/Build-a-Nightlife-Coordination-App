const express = require('express')
const passport = require('passport')
const yelp = require('./yelp/controller')
const user = require('./user/controller')
const rsvp = require('./rsvp/controller')

const router = express.Router()

const loginOptions = {
  failureRedirect: '/login',
  successFlash: 'Successful Login',
  failureFlash: true,
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) { return next()}
  return res.redirect('/login')
}

function saveSession(req, res, next) {
  req.session.save((err) => {
    if (err) {
      next(err)
    } else {
      next()
    }
  })
}

router.get('/login', (req, res) => {
  res.render('login', {title: 'Login', user: req.user})
})

router.get('/logout', (req, res) => {
  req.logout()
  delete req.session.context
  res.redirect('/')
})
router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: 'Profile', user: req.user})
})

router.get('/', rsvp.index)

router.get('/differentCity', user.differentCity, yelp.search)
router.get('/updateCity', user.updateCity, yelp.search)
router.post('/updateCity', user.updateCity, yelp.search)
router.post('/search', yelp.search)
router.get('/search', yelp.search)

router.get('/rsvp/create', isLoggedIn, rsvp.create)
router.get('/rsvp/remove', isLoggedIn, rsvp.remove)

router.get('/auth/google', passport.authenticate('google', {scope: ['profile']}))
router.get('/auth/google/callback',
passport.authenticate('google', loginOptions),
  saveSession,
  user.userLogin,
  yelp.search)

module.exports = router
