const yelp = require('yelp-fusion')

module.exports = (function yelpController() {
function search(req, res, next) {
  const clientId = process.env.YELP_CLIENT_ID
  const clientSecret = process.env.YELP_SECRET
  const city = req.query.city || req.body.city || (req.user || {}).city

  const searchRequest = {
    term: 'Cafes',
    location: city,
    categories: 'cafes',
  }

  const sessionCity = ((req.session || {}).context || {}).city

  if (!city || sessionCity === city) {
    console.log('No City or Same City, No Search Again')
    res.redirect('/')
  } else {
    console.log('Making Request to YELP API')
    yelp.accessToken(clientId, clientSecret)
      .then((tokenResponse) => {
        const client = yelp.client(tokenResponse.jsonBody.access_token)

        client.search(searchRequest)
          .then((searchResponse) => {
            const cafes = searchResponse.jsonBody.businesses
            const prettyJson = JSON.stringify(cafes[0], null, 4)
            console.log(prettyJson)
            console.log('Setting Session City', city)
            req.session.context = { title: city, city, cafes}
            res.redirect('/')
          })
          .catch(next)
      })
      .catch(next)
  }
}
return {
  search,
}
}())
