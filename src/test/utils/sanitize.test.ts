import { describe, it, expect } from 'vitest'
import { sanitizeInput, sanitizeHTML, sanitizeURL } from '../../utils/sanitize'

describe('sanitizeInput', () => {
  it('should remove HTML tags from input', () => {
    const input = '<script>alert("xss")</script>Hello'
    const result = sanitizeInput(input)
    expect(result).toBe('Hello')
  })

  it('should handle empty strings', () => {
    expect(sanitizeInput('')).toBe('')
    expect(sanitizeInput('   ')).toBe('')
  })

  it('should preserve plain text', () => {
    const input = 'Plain text without HTML'
    expect(sanitizeInput(input)).toBe('Plain text without HTML')
  })

  it('should trim whitespace', () => {
    expect(sanitizeInput('  test  ')).toBe('test')
  })
})

describe('sanitizeHTML', () => {
  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>'
    const result = sanitizeHTML(input)
    expect(result).toContain('Hello')
    expect(result).toContain('world')
  })

  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('<script>')
    expect(result).toContain('Hello')
  })

  it('should remove dangerous attributes', () => {
    const input = '<div onclick="alert(\'xss\')">Click</div>'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('onclick')
  })
})

describe('sanitizeURL', () => {
  it('should allow valid HTTP URLs', () => {
    expect(sanitizeURL('http://example.com')).toBe('http://example.com/')
    expect(sanitizeURL('https://example.com')).toBe('https://example.com/')
  })

  it('should reject javascript: URLs', () => {
    expect(sanitizeURL('javascript:alert("xss")')).toBeNull()
  })

  it('should reject data: URLs', () => {
    expect(sanitizeURL('data:text/html,<script>alert("xss")</script>')).toBeNull()
  })

  it('should return null for invalid URLs', () => {
    expect(sanitizeURL('not-a-url')).toBeNull()
  })

  it('should handle empty strings', () => {
    expect(sanitizeURL('')).toBeNull()
  })
})

