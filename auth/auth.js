module.exports = {
  googleAuth: {
    clientID: process.env.GOOGLE_KEY,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.APP_URL}/auth/google/callback`,
  }
}
