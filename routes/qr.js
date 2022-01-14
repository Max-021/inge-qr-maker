const express = require('express')
const { ErrorHandler } = require('../utils/error')
const router = express.Router()
const qrFuncs = require('../utils/qrUtils')
const userFuncs = require('../utils/usersUtils')
const format = require('../utils/formatUtils')
var zip = require('express-zip');
const fs = require('fs')
const cors = require('cors')
const jwt = require('jsonwebtoken')

router.use(function (req, res, next) {
    const token = req.headers['access-token'];
    if(token){
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if(err){
                res.status(401).send({message:'Token inválida'})
            } else {
                res.setHeader('access-token', token)
                req.decoded = decoded;
                next();
            }
        })
    } else {
        res.status(401).send({message:'Hace falta un token de autenticación'})
    }
})

router.get('/', async function(req, res) {
    try {
        const arrayQrs = await qrFuncs.getQrs()
        res.send(arrayQrs)
    } catch (error) {
        console.log(error)
        throw new ErrorHandler(500, 'Servidor no disponible')
    }
})
router.get('/download-all', async function(req, res){
    qrFuncs.dameTodosLosQRParaDescargar()
        .then(response => {
            res.zip(response, 'Codigos QR.zip')
        })
        .catch(e => {
            console.log(e)
            throw new ErrorHandler(500, e)
        })
})
router.get('/download/:id', cors({exposedHeaders: ['Content-Disposition'],}), async function(req, res){
    try{
        const qrD = await qrFuncs.dameEsteRegistro(req.params.id)
        const fileName = qrD.fileName
        const filePath = `./public/qrs/${fileName}`
        const stream = fs.createReadStream(filePath)
        res.set({
            'Content-Disposition':`attachment; filename=${fileName}`,
            'Content-Type':'image/png',
            'Name':fileName
        })
        res.set('Access-Control-Expose-Headers', 'Name')
        stream.on('open', function(){
            stream.pipe(res)
        })
        stream.on('error', function(e){
            res.end(e)
        })
    } catch(e){
        console.log(e)
        res.status(500).send('Error tratando de obtener este registro')
    }
})
router.get('/delete-all', function(req, res){
    try{
        qrFuncs.borraTodaLaDB()
        res.status(200).redirect('/qr/')
    } catch (e){
        console.log(e)
        throw new ErrorHandler(500, 'Error borrando todo: ' + e)
    }
})
router.post('/create', function(req, res){
    try {
        let registros = req.body
        if(registros.length){
            qrFuncs.registrar_y_crear(registros, res)
                .then((response) => {
                    res.status(201).json({
                        response, 
                        message:'¡Códigos creados correctamente!'
                    })
                })
                .catch(e => {
                    console.log(e)
                    throw new ErrorHandler(500, 'Hubo un problema al crear los Codigos QR')
                })
        } else {
            throw new ErrorHandler(400, 'No se enviaron registros para crear códigos')
        }
    } catch (error) {
        throw new ErrorHandler(500, 'No se pudieron crear los Codigos QR. Error: '+error)
    }
})
router.post('/prepare-array', function(req, res){
    try{
        let registros = req.body
        if(registros.length){
            let paquetitoZip = format.dameUnArrayFormateado(registros)
            res.status(201).json(paquetitoZip)
        } else {
            throw new ErrorHandler(500, 'No se enviaron registros para crear códigos')
        }
    } catch (e) {
        throw new ErrorHandler(500, 'No se pudo crear el array para descargar de zip')
    }
})
router.post('/download', function(req, res){
    let qrs = req.body
    res.zip(qrs, 'Codigos QR')
})
router.get('/users', async function(req, res){
	try{
		let usuarios = await userFuncs.getUsuarios()
		res.send(usuarios)
	} catch(e) {
		console.log(e)
	}
})
module.exports = router