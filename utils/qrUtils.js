const QR = require('../Models/QR')
const qr_code = require('qrcode')
const { ErrorHandler } = require('./error')

const getQrs = () => {
    return QR.find()
}
const dameElStringLimpio = (string) => {
    if(string){
        let newString = string.replace(/[\s+,.]/g, "").toLowerCase() //Con esto le saco todos los espacios en blanco, las comas y los puntos
        return newString
    }
}
const dameElNombreDeLaImagen = (cliente, unidad, equipo) =>{
    let clienteT = dameElStringLimpio(cliente)
    let unidadT = dameElStringLimpio(unidad)
    let equipoT = dameElStringLimpio(equipo)

    return clienteT+'-'+unidadT+'-'+equipoT+'.png'
}
const dameLaUrl = (clientPackage) =>{
    const baseIngePath = 'https://www.ingeray.com.ar/inge_system/alta-servicio-tecnico?'
    let clientePath = 'cliente='+clientPackage.cliente
    let unidadPath = '&unidad='+clientPackage.unidad
    let contactoPath = '&contacto='+clientPackage.contacto
    let telefonoPath = '&telefono='+clientPackage.telefono
    let equipoPath = '&equipo='+clientPackage.equipo
    return baseIngePath+clientePath+unidadPath+contactoPath+telefonoPath+equipoPath
}
const armameUnPaquetitoZip = (reg) => {
    let fileName = dameElNombreDeLaImagen(reg.cliente, reg.unidad, reg.equipo)
    return {
        path: `./public/qrs/${fileName}`,
        name: fileName
    }
}
const creameUnQrObject = (body) => {
    return {
        cliente: body.cliente,
        unidad: body.unidad,
        telefono: body.telefono,
        contacto: body.contacto,
        equipo: body.equipo,
        uri: dameLaUrl(body),
        fileName: dameElNombreDeLaImagen(body.cliente, body.unidad, body.equipo)
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
    qr_code.toDataURL(reg.uri)
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
            resolve(dameUnArrayFormateado(registros))
        } else {
            reject(new Error('No hay registros para crear los codigos'))
        }
    })
}
const dameUnArrayFormateado = (array) => {
    let zipArray = []
    array.forEach(reg => {
        let paquetito = armameUnPaquetitoZip(reg)
        zipArray.push(paquetito)
    })
    return zipArray
}
const descargarUno = (res, reg) => {
    let qrPaquetito = armameUnPaquetitoZip(reg)
    res.zip(qrPaquetito)
}
const descargarVarios = (regArray) => {
    return new Promise((resolve, reject) => {
        if(regArray.length){
            let qrPaquetitos = regArray.map(reg => JSON.stringify(reg)).forEach(reg => {
                let qrPaquetito = armameUnPaquetitoZip(reg)
                return qrPaquetito
            })
            resolve(qrPaquetitos)
        } else {
            reject('No hay registros para los cuales crear codigos QR')
        }
    })
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
const descargarTodo = async () => {
    let allQrs = await QR.find({})
    return new Promise((resolve, reject) => {
        if(allQrs.length){
            let qrs = allQrs.map(reg => {
                let paquetitoZip = armameUnPaquetitoZip(reg)
                return paquetitoZip
            })
            resolve(qrs)
        }else{
            reject(new Error('No hay codigos para descargar'))
        }
    })


}
module.exports = {
    getQrs,
    dameLaUrl,
    dameElNombreDeLaImagen,
    dameElStringLimpio,
    registraloEnLaDB,
    creameLaImagen,
    borrameTodo,
    descargarUno,
    registrar_y_crear,
    descargarVarios,
    armameUnPaquetitoZip,
    descargarTodo
}