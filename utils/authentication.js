const jwt = require('jsonwebtoken');
const userFuncs = require('./usersUtils')

const autenticarUsuario = async function(user){
    let token = null
    let existe = await userFuncs.existeElUsuario(user.username)
    if(existe){
        const payload = {
            check: true
        }
        token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: '15m'})
        userFuncs.asignarTokenAlUsuario(user.username, token)
    } 
    return token
}

const verificarToken = function(username, token){
    if(!token){
        return {message:'Falta el token', validated: false}    
    }

    let isVerificated = userFuncs.verificarTokenUsuario(username, token)
        .then(response => {
            return {message: response.message, validated: response.verificado} //Si coincide el usuario con el token devuelve true
        })
        .catch(e => {
            console.log(e)
            return {message: 'No se pudo verificar la validez del token, intenta mas tarde', validated: false}
        })

    return isVerificated
}

module.exports = {
    autenticarUsuario,
    verificarToken
}