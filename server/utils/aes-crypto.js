// Use AES to encrypt and decrypt the id of the user, place, reservation, etc. in the URL parameters to prevent information leakage.
const crypto = require('crypto');

// Generate secret hash with crypto to use for encryption
const key = crypto
    .createHash('sha512')
    .update(process.env.AES_SECRET_KEY)
    .digest('hex')
    .substring(0, 32)
const encryptionIV = crypto
    .createHash('sha512')
    .update(process.env.AES_SECRET_IV)
    .digest('hex')
    .substring(0, 16)

// Return secret hash
// exports.generateSecretHash = () => {
//     return {
//         key,
//         encryptionIV,
//     }
// }

// Encrypt data
exports.encryptData = (data) => {
    const cipher = crypto.createCipheriv(process.env.AES_ENCRYPTION_ALGORITHM, key, encryptionIV)
    return Buffer.from(
        cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64') // Encrypts data and converts to hex and base64
}

// Decrypt data
exports.decryptData = (encryptedData) => {
    const buff = Buffer.from(encryptedData, 'base64')
    const decipher = crypto.createDecipheriv(process.env.AES_ENCRYPTION_ALGORITHM, key, encryptionIV)
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    ) // Decrypts data and converts to utf8
}