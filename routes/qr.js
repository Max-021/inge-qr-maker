const express = require('express')
const path = require('path')
const router = express.Router()
const zip = require('express-zip')

const QR = require('../Models/QR')
const qr_code = require('qrcode')
const { read } = require('fs')


router.get('/', async (req, res) => {
    try {
        const arrayQrs = await QR.find()
        res.send(arrayQrs)
    } catch (error) {
        console.log(error)
    }
})

router.post('/create', async (req, res) => {
    try {
        let cliente     = req.body.cliente
        let equipo      = req.body.equipo
        if(cliente && equipo){
            await registraloEnLaDB(req.body)
            creameLaImagen(req.body, res)
        }else{
            res.status(500).send('Falta completar el cliente o el equipo')
        }
    } catch (error) {
        return res.status(500).json({
            mensaje: 'Ocurrió un error',
            error
        })
    }
})
router.get('/qr-dowload', function(req, res){
    //TODO: Implementar esto 
})
router.get('/download-all', async function(req, res){
    let allQrs = await QR.find({})
    let qrs = []
    allQrs.forEach(reg => {
        let paquetitoZip = armameUnPaquetitoZip(reg)
        qrs.push(paquetitoZip)
    })
    res.zip(qrs)
})
router.get('/delete-all', function(req, res){
    try{
        borrameTodo()
        res.status(200).redirect('/qr/')
    } catch (e){
        res.status(500).send(e)
        console.log('Error borrando todo: ' + e)
    }
})

const dameLaUrl = (clientPackage) =>{
    const baseIngePath = 'https://www.ingeray.com.ar/inge_system/alta-servicio-tecnico?'
    let clientePath = 'cliente='+clientPackage.cliente
    let unidadPath = '&unidad='+clientPackage.unidad
    let contactoPath = '&contacto='+clientPackage.contacto
    let telefonoPath = '&telefono='+clientPackage.telefono
    let equipoPath = '&equipo='+clientPackage.equipo
    return baseIngePath+clientePath+unidadPath+contactoPath+telefonoPath+equipoPath
}
const dameElNombreDeLaImagen = (cliente, unidad, equipo) =>{
    let clienteT = dameElStringLimpio(cliente)
    let unidadT = dameElStringLimpio(unidad)
    let equipoT = dameElStringLimpio(equipo)

    return clienteT+'-'+unidadT+'-'+equipoT+'.png'
}
const dameElStringLimpio = (string) => {
    let newString = string.replace(/[\s+,.]/g, "").toLowerCase() //Con esto le saco todos los espacios en blanco, las comas y los puntos
    return newString
}
const creameLaImagen = (body, res) => {
    let url = dameLaUrl(body)
    qr_code.toDataURL(url)
        .then(imgCode => {
            const imgName = dameElNombreDeLaImagen(body.cliente, body.unidad, body.equipo)
            const imgPath = 'public/qrs/'+imgName
            qr_code.toFile(imgPath, url)
                .then(a => {
                    res.status(200).send('Codigo creado!')
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).send('No se pudo generar el codigo solicitado')
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                mensaje: 'Ocurrió un error',
                error: err
            })
        })
}
const registraloEnLaDB = (body) => {
    let cliente = body.cliente
    let unidad = body.unidad
    let equipo = body.equipo
    let qrObject = {
        cliente,
        unidad,
        telefono: body.telefono,
        contacto: body.contacto,
        equipo,
        uri: dameLaUrl(body),
        fileName: dameElNombreDeLaImagen(cliente, unidad, equipo)
    }
    const QrDB = new QR(qrObject)
    QrDB.save()
}
const borrameTodo = async () => {
    QR.deleteMany({})
    .then(function(){
        console.log('Todo borrado :D')
    })
    .catch(function(e){
        console.log('ups, no pude borrar nada')
    })
}
const armameUnPaquetitoZip = (reg) => {
    return {
        path: `./public/qrs/${reg.fileName}`,
        name: reg.fileName
    }
}
module.exports = router