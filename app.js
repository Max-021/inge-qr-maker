const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const app = express();
const { handleError } = require('./utils/error');

require('dotenv').config()

const port = process.env.PORT || 3000

const mongoose = require('mongoose')
const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASS}@ingeray-qr-code.3g8ej.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => {
		console.log('App lista para crear códigos QR')
		console.log('################################################################################')
	})
	.catch(error => {console.log(error)})

app.use(morgan('tiny'))
app.use(cors())

app.use((err, req, res, next) => {
	handleError(err, res)
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/qr', require('./routes/qr'));

const history = require('connect-history-api-fallback');
app.use(history())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/qrs', express.static('qrs'))

app.listen(port, function(){
	console.clear()
	console.log('Escuchando en el puerto http://localhost:'+port)
})
