const QR                    = require('../Models/QR')
const qr_code               = require('qrcode')
const { ErrorHandler }      = require('./error')
const format                = require('./formatUtils')

const getQrs = () => {
    return QR.find()
}
const creameUnQrObject = (body) => {
    return {
        cliente: body.cliente,
        unidad: body.unidad,
        // telefono: body.telefono,
        // contacto: body.contacto,
        equipo: body.equipo,
        uri: format.dameLaUrl(body),
        fileName: format.dameElNombreDeLaImagen(body.cliente, body.unidad, body.equipo)
    }
}
const registraloEnLaDB = (body) => {
    return new Promise((resolve, reject) => {
        if(body.cliente && body.equipo){
            let qrObject = creameUnQrObject(body)
            try{
                const QrDB = new QR(qrObject)
                QrDB.save()            
                resolve(qrObject)
            }catch(error){
                console.log(error)
                reject(error)
            }
        } else {
            reject(new Error('Faltó completar el cliente o el equipo'))
        }
    })   
}
const creameLaImagen = (reg, res) => {
    const options = {
        errorCorrectionLevel: 'Q',
    }

    qr_code.toDataURL(reg.uri,options)
        .then(imgCode => {
            const imgPath = 'public/qrs/'+reg.fileName
            qr_code.toFile(imgPath, reg.uri)
                .then(a => {
                    console.log(`Imagen ${reg.fileName} creada!`)
                })
                .catch(err => {
                    console.log(err)
                    throw new ErrorHandler(500, 'No se crear la imagen del código')
                })
        })
        .catch(err => {
            console.log(err)
            throw new ErrorHandler(500, err)
        })
}
const registrar_y_crear = (registros, res) => {
    return new Promise(async (resolve, reject) => {
        if(registros.length > 0){
            await registros.forEach(registro => {
                if(registro.cliente && registro.equipo){
                    registraloEnLaDB(registro)
                        .then((registro) => creameLaImagen(registro, res))
                } else {
                    res.status(500).send('Falta completar el cliente o el equipo')
                }
            })
            resolve(format.dameUnArrayFormateado(registros))
        } else {
            reject(new Error('No hay registros para crear los codigos'))
        }
    })
}
const descargarUno = (res, reg) => {
    let qrPaquetito = format.armameUnPaquetitoZip(reg)
    res.zip(qrPaquetito)
}
const descargarVarios = (regArray) => {
    return new Promise((resolve, reject) => {
        if(regArray.length){
            let qrPaquetitos = regArray.map(reg => JSON.stringify(reg)).forEach(reg => {
                let qrPaquetito = format.armameUnPaquetitoZip(reg)
                return qrPaquetito
            })
            resolve(qrPaquetitos)
        } else {
            reject('No hay registros para los cuales crear codigos QR')
        }
    })
}
const borraTodaLaDB = async () => {
    QR.deleteMany({})
        .then(function(){
            console.log('Todo borrado :D')
        })
        .catch(function(e){
            console.log('ups, no pude borrar nada')
        })
}
const dameTodosLosQRParaDescargar = async () => {
    let allQrs = await QR.find({})
    console.log('Estos son todos los QR para descargar')
    console.log(allQrs)
    return new Promise((resolve, reject) => {
        if(allQrs.length){
            let qrs = allQrs.map(reg => {
                let paquetitoZip = format.armameUnPaquetitoZip(reg)
                return paquetitoZip
            })
            resolve(qrs)
        }else{
            reject(new Error('No hay codigos para descargar'))
        }
    })


}
const dameEsteRegistro = async (id) => {
    let qr = await QR.findById({_id: id}).exec()
    // console.log(qr) 
    return qr
}

module.exports = {
    getQrs,
    registraloEnLaDB,
    creameLaImagen,
    borraTodaLaDB,
    descargarUno,
    registrar_y_crear,
    descargarVarios,
    dameTodosLosQRParaDescargar,
    dameEsteRegistro
}