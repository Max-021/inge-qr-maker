const jwt = require('jsonwebtoken');
const userFuncs = require('./usersUtils')

const autenticarUsuario = async function(user){
    let token = null
    let existe = await userFuncs.existeElUsuario(user.username)
    if(existe){
        const payload = {
            check: true
        }
        token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: 1440})
        userFuncs.asignarTokenAlUsuario(user.username, token)
    } 
    return token
}

const verificarToken = async function(username, token){
    if(token){
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if(err){
                return false
            } else{
                userFuncs.verificarTokenUsuario(username, token)
                    .then(response => {
                        return response //Si coincide el usuario con el token devuelve true
                    })
                    .catch(e => {
                        console.log(e)
                        return false
                    })
            }
        })
    } else {
        return false        
    }
}

module.exports = {
    autenticarUsuario,
    verificarToken
}