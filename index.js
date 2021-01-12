const express = require('express')

const app = express()


app.get('/', (req, res, next) => {
    res.send('<p>HI</p>')
})

app.listen(5000, port => console.log(`Listening on port ${port}`))