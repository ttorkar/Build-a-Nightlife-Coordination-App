const User = require('./User')
const yelp = require('../yelp/controller')

module.exports = (function UserController() {
  function userLogin(req, res, next) {
    const userCity = req.user.city
    const sessionCity = ((req.session || {}).context || {}).city

    if (!userCity) {
      if (sessionCity) {
        res.redirect(`/updateCity?city=${sessionCity}`)
      } else {
        res.redirect('/profile')
      }
    } else if (sessionCity && (userCity !== sessionCity)) {
      res.redirect('/differentCity')
    } else {
      next()
    }
  }

function updateCity(req, res, next) {
  const city = req.body.city || req.query.city
  if (city && req.user) {
    User.update({ _id: req.user.id}, {$set: {city}})
    .then(() => yelp.search(req, res, next))
    .catch(next)
  } else {
    next()
  }
}

function differentCity(req, res) {
  const sessionCity = ((req.session || {}).context || {}).city

  res.render('updateProfile', {title:'Update Profile', user: req.user, city: sessionCity})
}

return {
  updateCity, userLogin, differentCity
}
}())
