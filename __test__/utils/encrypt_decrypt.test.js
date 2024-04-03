const { encrypt, decrypt } = require('../../src/utils/encrypt_decrypt');

describe('encrypt_decrypt module', () => {
    const secret = 'mySecret';
    const text = 'Hello, World!';

    it('encrypts the text correctly', () => {
        const encrypted = encrypt(text, secret);
        expect(encrypted).toBe(btoa(text + btoa(secret)));
    });

    it('decrypts the text correctly', () => {
        const encrypted = encrypt(text, secret);
        const decrypted = decrypt(encrypted, secret);
        expect(decrypted).toBe(text);
    });
});