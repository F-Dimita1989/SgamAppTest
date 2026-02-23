import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'

// Mock delle API
const mockVerifyAuthApi = vi.fn()
vi.mock('../../utils/authApi', () => ({
  loginApi: vi.fn(),
  verifyAuthApi: mockVerifyAuthApi,
  logoutApi: vi.fn(),
  setStoredToken: vi.fn(),
  clearStoredToken: vi.fn(),
}))

const TestComponent = () => {
  const { isAuthenticated, isLoading } = useAuth()
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide auth context', () => {
    mockVerifyAuthApi.mockResolvedValue({ authenticated: false })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth')).toBeInTheDocument()
  })

  it('should throw error when used outside provider', () => {
    // Sopprimi console.error per questo test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow()

    consoleSpy.mockRestore()
  })
})

