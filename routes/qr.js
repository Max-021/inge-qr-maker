const express = require('express')
const { ErrorHandler } = require('../utils/error')
const router = express.Router()
const qrFuncs = require('../utils/qrUtils')
var zip = require('express-zip');

router.get('/', async (req, res) => {
    try {
        const arrayQrs = await qrFuncs.getQrs()
        res.send(arrayQrs)
    } catch (error) {
        console.log(error)
        throw new ErrorHandler(500, 'Servidor no disponible')
    }
})
router.post('/create', (req, res) => {
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
                    throw new ErrorHandler(500, 'Hubo un problema con la creacion de los Codigos QR')
                })
        } else {
            throw new ErrorHandler(400, 'No se enviaron registros para crear códigos')
        }
    } catch (error) {
        throw new ErrorHandler(500, 'Hubo un problema con la creacion de los Codigos QR. Error: '+error)
    }
})
router.get('/dowload/:id', function(req, res){
    //TODO: Implementar esto 
})
router.post('/download', function(req, res){
    let qrs = req.body
    res.zip(qrs, 'Codigos QR')
})
router.get('/download-all', async function(req, res){
  let allQrs = await QR.find({})
  let qrs = []
  allQrs.forEach(reg => {
      let paquetitoZip = armameUnPaquetitoZipQR(reg)
      qrs.push(paquetitoZip)
  })
  descargarVarios(qrs)
    .then(codigos => {
        res.zip(codigos, 'CodigosQR')
    })
    .catch(e => {
        console.log(e)
        res.status(500).send('No se pudieron descargar los codigos QR')
    })
})
router.get('/delete-all', function(req, res){
    try{
        qrFuncs.borrameTodo()
        res.status(200).redirect('/qr/')
    } catch (e){
        console.log(e)
        throw new ErrorHandler(500, 'Error borrando todo: ' + e)
    }
})

module.exports = router