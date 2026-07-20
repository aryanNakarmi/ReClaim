import axios from './axios';
import { API } from './endpoints';

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
}

export interface MFAStatusResponse {
  enabled: boolean;
}

/**
 * Initiate MFA setup — generates a TOTP secret and QR code.
 * The user must scan the QR code with an authenticator app and
 * then call verifyAndEnableMFA with the code shown in the app.
 */
export const setupMFA = async (): Promise<MFASetupResponse> => {
  const response = await axios.get('/api/v1/mfa/setup');
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to setup MFA');
};

/**
 * Verify a TOTP token and enable MFA for the user.
 * @param token The 6-digit code from the authenticator app
 */
export const verifyAndEnableMFA = async (token: string): Promise<void> => {
  const response = await axios.post('/api/v1/mfa/verify', { token });
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to verify MFA');
  }
};

/**
 * Disable MFA. Requires a valid TOTP token to confirm.
 * @param token The 6-digit code from the authenticator app
 */
export const disableMFA = async (token: string): Promise<void> => {
  const response = await axios.post('/api/v1/mfa/disable', { token });
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to disable MFA');
  }
};

/**
 * Check whether MFA is currently enabled for the authenticated user.
 */
export const getMFAStatus = async (): Promise<MFAStatusResponse> => {
  const response = await axios.get('/api/v1/mfa/status');
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to check MFA status');
};
