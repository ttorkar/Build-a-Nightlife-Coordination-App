const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../user/User.js')
const configAuth = require('./auth')

function Passport(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })


  passport.deserializeUser((id, done) => {
    User.findById( id, (err, user) => {
      done(err,user)
    })
  })

  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
  },
(token, refreshToken, profile, done) => {
  process.nextTick(() => {
    console.log(profile)
    User.findOne({'google.id': profile.id}, (err, user) => {
      if (err) { return done(err)}

      if (user) { return done(null,user)}

      const newUser = new User()

      newUser.google.id = profile.id
      newUser.google.displayName = profile.displayName
      newUser.username = profile.displayName

      return newUser.save((ers) => {
        if (ers) {
          throw ers
        }
        return done(null, newUser)
      })
    })
  })
}))
}

module.exports = Passport
