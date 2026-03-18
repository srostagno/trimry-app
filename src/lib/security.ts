import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const SALT_LENGTH = 16
const KEY_LENGTH = 64
const MIN_PASSWORD_LENGTH = 10

export function validatePasswordStrength(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      reason: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    }
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      valid: false,
      reason:
        'Password must include at least one uppercase letter, one lowercase letter, and one number.',
    }
  }

  return { valid: true }
}

export function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH).toString('hex')
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${derivedKey}`
}

export function verifyPassword(password: string, encodedHash: string) {
  const [salt, storedHash] = encodedHash.split(':')

  if (!salt || !storedHash) {
    return false
  }

  const derivedKey = scryptSync(password, salt, KEY_LENGTH)
  const storedBuffer = Buffer.from(storedHash, 'hex')

  if (derivedKey.byteLength !== storedBuffer.byteLength) {
    return false
  }

  return timingSafeEqual(derivedKey, storedBuffer)
}
