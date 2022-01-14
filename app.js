const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const app = express();
const { handleError } = require('./utils/error');
const authentication = require('./utils/authentication');

require('dotenv').config()

const port = process.env.PORT || 3000

const mongoose = require('mongoose')
const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASS}@ingeray-qr-code.5oyjr.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`

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

//? Autenticacion
app.post('/authenticate', async function(req, res){
    try{
        let token = await authentication.autenticarUsuario(req.body)
        if(token !== null){
            res.json({
                message: 'Autenticacion correcta',
                token
            })
        } else {
            res.json({
                message: 'Usuario incorrecto'
            })
        }
    }
    catch(e){
        res.json(e)
    }
})

//? Verifiacion del token
app.post('/verify', function(req, res){
	let tokenPartido = req.body.token.split(' ', 2)
	let username = tokenPartido[0]
	let token = tokenPartido[1]
	let resultadoAutenticacion = authentication.verificarToken(username, token)
	resultadoAutenticacion ? 
		res.status(200).send({message: 'Token verificado correctamente', isValidated: true}) :
		res.status(401).send({message: 'El token es invalido, puede ser que haya caducado', isValidated: false})
})

//? Endpoints de la API
app.use('/qr', require('./routes/qr'));

const history = require('connect-history-api-fallback');
app.use(history())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/qrs', express.static('qrs'))

app.listen(port, function(){
	console.clear()
	console.log('Escuchando en el puerto http://localhost:'+port)
})
