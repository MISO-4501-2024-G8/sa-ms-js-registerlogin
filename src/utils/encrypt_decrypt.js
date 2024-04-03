function encrypt(text, secret) {
    const encryptsc = btoa(secret);
    return btoa(text + encryptsc);
}

function decrypt(text, secret) {
    const decryptsc = btoa(secret);
    return atob(text).replace(decryptsc, '');
}

module.exports = {
    encrypt,
    decrypt
};