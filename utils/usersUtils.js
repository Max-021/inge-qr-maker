const User = require('../Models/User')

const getUsuarios = () =>{
    return User.find()
}
const existeElUsuario = async function(username_){
    let response = await User.findOne({username: username_}).exec()

    return response !== null
}
const asignarTokenAlUsuario = async function(username_, token){
    try{
        const filtro = {username: username_}
        const update = {token}

        let response = await User.findOneAndUpdate(filtro, update, {rawResult: true})

        response.lastErrorObject.updatedExisting ? 
            console.log(`Token del usuario ${username_} actualizado!`) :
            console.log(`Se creó un documento para el usuario ${username_}`)

    } catch(e){
        console.log(e)
    }
}
const verificarTokenUsuario = async function(username_, token){
    let usuario = await User.findOne({username: username_}).exec()
    return usuario.token === token
}

module.exports = {
    existeElUsuario,
    asignarTokenAlUsuario,
    verificarTokenUsuario,
    getUsuarios
}