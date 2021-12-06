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
const dameUnArrayFormateado = (array) => {
    let zipArray = []
    array.forEach(reg => {
        let paquetito = armameUnPaquetitoZip(reg)
        zipArray.push(paquetito)
    })
    return zipArray
}
module.exports = {
    dameElStringLimpio,
    dameElNombreDeLaImagen,
    dameLaUrl,
    armameUnPaquetitoZip,
    dameUnArrayFormateado
}