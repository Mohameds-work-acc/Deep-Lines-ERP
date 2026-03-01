
export interface LoginResponse {
  token: string;
  refreshToken: {
    id: number;
    token: string;
    expiryDate: string;
  };
  message: string;
}
