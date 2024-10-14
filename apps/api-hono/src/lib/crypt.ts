import crypto from 'node:crypto'

// Encrypt using AES-256-GCM
export function encrypt(text: string, secret: string): string {
  const key = crypto.scryptSync(secret, 'salt', 32)
  const iv = crypto.randomBytes(12) // 12 bytes IV is recommended for GCM mode
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`
}

// Decrypt using AES-256-GCM
export function decrypt(text: string, secret: string): string {
  if (!text || typeof text !== 'string') {
    throw new TypeError('Invalid encrypted text provided')
  }

  const key = crypto.scryptSync(secret, 'salt', 32)
  const parts = text.split(':')
  if (parts.length !== 3) {
    throw new TypeError('Invalid encrypted text format')
  }

  const [ivHex, encryptedHex, authTagHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const encryptedText = Buffer.from(encryptedHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString('utf8')
}

/**
 * Sign and encrypt a value
 *
 * @param val - The object to be encrypted
 * @param secret - The secret key
 * @return - The encrypted and signed string
 */
export function sign<T>(val: T, secret: string): string {
  if (secret == null) throw new TypeError('Secret key must be provided.')

  // Convert value to JSON string
  const jsonVal = JSON.stringify(val)

  // Encrypt the value
  const encryptedVal = encrypt(jsonVal, secret)

  // Generate signature
  const signature = crypto.createHmac('sha256', secret).update(encryptedVal).digest('base64').replace(/=+$/, '')

  return `${encryptedVal}.${signature}`
}

/**
 * Verify signature and decrypt the value
 *
 * @param input - The encrypted and signed string
 * @param secret - The secret key
 * @return - The decrypted object if signature is valid, null otherwise
 */
export function unsign<T>(input: string, secret: string): T | null {
  if (typeof input !== 'string') throw new TypeError('Signed string must be provided.')
  if (secret == null) throw new TypeError('Secret key must be provided.')

  const lastIndex = input.lastIndexOf('.')
  const encryptedVal = input.slice(0, lastIndex)
  const signature = input.slice(lastIndex + 1)

  // Generate expected signature
  const expectedSignature = crypto.createHmac('sha256', secret).update(encryptedVal).digest('base64').replace(/=+$/, '')

  // Check if signatures match
  if (signature !== expectedSignature) return null

  const decryptedJson = decrypt(encryptedVal, secret)

  try {
    return JSON.parse(decryptedJson) as T
  } catch {
    return null
  }
}
