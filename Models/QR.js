const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const qrSchema = new Schema({
    cliente: String,
    unidad: String,
    contacto: String,
    telefono: String,
    equipo: String,
    uri: String,
    fileName: String
})

const QR = mongoose.model('QR', qrSchema)

module.exports = QR