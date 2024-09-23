import crypto from 'node:crypto'

export function generateRandomNumberString(length = 8) {
  return crypto
    .randomInt(10 ** length - 1)
    .toString()
    .padStart(length, '0')
}

export function generateRandomURLString(length = 128) {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length)
}
