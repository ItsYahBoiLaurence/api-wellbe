import * as CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.JWT_SECRET!;

export function encryptData(data: object): string {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    return ciphertext;
}

export function decryptData(ciphertext: string): object {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
}