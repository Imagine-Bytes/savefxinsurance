const express = require('express')
import "dotenv/config";
const app = express()
const port = process.env.PORT;

app.get('/', (req, res, next) => {
    res.send('<p>HI</p>')
})

app.listen(port, port => console.log(`Listening on port ${port}`))