import { describe, it, expect } from 'vitest'
import {
  validateTerm,
  validateDefinition,
  validateCategory,
  validateWord,
  validatePassword,
} from '../../utils/validation'

describe('validateTerm', () => {
  it('should reject empty terms', () => {
    const result = validateTerm('')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('obbligatorio')
  })

  it('should reject terms longer than 200 characters', () => {
    const longTerm = 'a'.repeat(201)
    const result = validateTerm(longTerm)
    expect(result.valid).toBe(false)
  })

  it('should accept valid terms', () => {
    expect(validateTerm('SPID').valid).toBe(true)
    expect(validateTerm('Carta Identità Elettronica').valid).toBe(true)
  })

  it('should accept terms with accents', () => {
    expect(validateTerm('Prenotazione').valid).toBe(true)
  })
})

describe('validateDefinition', () => {
  it('should reject empty definitions', () => {
    const result = validateDefinition('')
    expect(result.valid).toBe(false)
  })

  it('should reject definitions longer than 2000 characters', () => {
    const longDef = 'a'.repeat(2001)
    const result = validateDefinition(longDef)
    expect(result.valid).toBe(false)
  })

  it('should reject XSS patterns', () => {
    const xssDef = '<script>alert("xss")</script>'
    const result = validateDefinition(xssDef)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('non sicuro')
  })

  it('should accept valid definitions', () => {
    expect(validateDefinition('Una definizione valida').valid).toBe(true)
  })
})

describe('validateCategory', () => {
  it('should reject empty categories', () => {
    const result = validateCategory('')
    expect(result.valid).toBe(false)
  })

  it('should accept valid categories', () => {
    expect(validateCategory('Sicurezza').valid).toBe(true)
    expect(validateCategory('Guide').valid).toBe(true)
  })
})

describe('validateWord', () => {
  it('should reject empty words', () => {
    const result = validateWord('')
    expect(result.valid).toBe(false)
  })

  it('should accept valid words', () => {
    expect(validateWord('ciao').valid).toBe(true)
    expect(validateWord('hello world').valid).toBe(true)
  })
})

describe('validatePassword', () => {
  it('should reject empty passwords', () => {
    const result = validatePassword('')
    expect(result.valid).toBe(false)
  })

  it('should reject passwords shorter than 8 characters', () => {
    expect(validatePassword('short').valid).toBe(false)
  })

  it('should accept valid passwords', () => {
    expect(validatePassword('password123').valid).toBe(true)
    expect(validatePassword('a'.repeat(8)).valid).toBe(true)
  })

  it('should reject passwords longer than 128 characters', () => {
    const longPassword = 'a'.repeat(129)
    const result = validatePassword(longPassword)
    expect(result.valid).toBe(false)
  })
})

