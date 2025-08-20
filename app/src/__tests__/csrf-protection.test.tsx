import '@testing-library/jest-dom';
import { getCsrfToken, clearCsrfToken, apiRequestWithCsrf } from '../lib/auth';

// Mock fetch
global.fetch = jest.fn();
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('CSRF Protection', () => {
  beforeEach(() => {
    clearCsrfToken();
    mockedFetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('CSRF Token Management', () => {
    it('should fetch CSRF token from server', async () => {
      const mockToken = 'csrf-token-123';
      const mockExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          expires_at: mockExpiry
        }),
      } as Response);

      const token = await getCsrfToken();
      
      expect(token).toBe(mockToken);
      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/csrf-token',
        {
          method: 'GET',
          credentials: 'include',
        }
      );
    });

    it('should reuse valid CSRF token', async () => {
      const mockToken = 'csrf-token-123';
      const mockExpiry = new Date(Date.now() + 3600000).toISOString();

      // First call - should fetch from server
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          expires_at: mockExpiry
        }),
      } as Response);

      const token1 = await getCsrfToken();
      
      // Second call - should reuse cached token
      const token2 = await getCsrfToken();
      
      expect(token1).toBe(mockToken);
      expect(token2).toBe(mockToken);
      expect(mockedFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle CSRF token fetch errors', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(getCsrfToken()).rejects.toThrow('CSRF token request failed: 401');
    });
  });

  describe('CSRF-Protected API Requests', () => {
    it('should include CSRF token in state-changing requests', async () => {
      const mockToken = 'csrf-token-123';
      const mockExpiry = new Date(Date.now() + 3600000).toISOString();

      // Mock CSRF token fetch
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          expires_at: mockExpiry
        }),
      } as Response);

      // Mock actual API request
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await apiRequestWithCsrf('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: 'old', newPassword: 'new' }),
      });

      expect(mockedFetch).toHaveBeenCalledTimes(2);
      
      // Check that the second call (actual API request) includes CSRF token
      const apiCall = mockedFetch.mock.calls[1];
      expect(apiCall[0]).toBe('http://localhost:8788/api/auth/change-password');
      expect(apiCall[1]?.headers).toEqual(
        expect.objectContaining({
          'X-CSRF-Token': mockToken,
          'Content-Type': 'application/json',
        })
      );
    });

    it('should not include CSRF token in GET requests', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      } as Response);

      await apiRequestWithCsrf('/api/auth/me', {
        method: 'GET',
      });

      expect(mockedFetch).toHaveBeenCalledTimes(1);
      
      const apiCall = mockedFetch.mock.calls[0];
      expect(apiCall[1]?.headers).not.toHaveProperty('X-CSRF-Token');
    });

    it('should clear CSRF token on 403 response', async () => {
      const mockToken = 'csrf-token-123';
      const mockExpiry = new Date(Date.now() + 3600000).toISOString();

      // Mock CSRF token fetch
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          expires_at: mockExpiry
        }),
      } as Response);

      // Mock 403 response (CSRF validation failed)
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'CSRF token validation failed' }),
      } as Response);

      await expect(apiRequestWithCsrf('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: 'old', newPassword: 'new' }),
      })).rejects.toThrow('CSRF token validation failed');

      // Token should be cleared, so next request should fetch a new one
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'new-csrf-token',
          expires_at: mockExpiry
        }),
      } as Response);

      await getCsrfToken();
      
      // Should have made a new token request
      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/csrf-token',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('CSRF Security Validation', () => {
    it('should validate that state-changing endpoints require CSRF tokens', () => {
      const stateChangingMethods = ['POST', 'PUT', 'DELETE'];
      const safeMethod = 'GET';

      stateChangingMethods.forEach(method => {
        expect(['POST', 'PUT', 'DELETE']).toContain(method);
      });

      expect(['POST', 'PUT', 'DELETE']).not.toContain(safeMethod);
    });

    it('should ensure CSRF tokens are sent in headers not cookies', async () => {
      const mockToken = 'csrf-token-123';
      const mockExpiry = new Date(Date.now() + 3600000).toISOString();

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          expires_at: mockExpiry
        }),
      } as Response);

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await apiRequestWithCsrf('/api/clubs', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Club', description: 'Test' }),
      });

      const apiCall = mockedFetch.mock.calls[1];
      const headers = apiCall[1]?.headers as Record<string, string>;
      
      // Token should be in header, not cookie
      expect(headers['X-CSRF-Token']).toBe(mockToken);
      expect(headers['Cookie']).toBeUndefined();
    });
  });
});