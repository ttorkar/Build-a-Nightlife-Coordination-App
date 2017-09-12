const app = require('./app')

const server = app.listen(process.env.PORT || 3000, () => {
  const port = server.address().port
  console.log('Listening on Port ' + port)
})
