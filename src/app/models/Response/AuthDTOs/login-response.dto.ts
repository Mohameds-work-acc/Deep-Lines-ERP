
export interface LoginResponse {
  token: string;
  refreshToken: {
    id: number;
    token: string;
    expiryDate: string;
  };
  user : {
    id: number;
    email: string;
    role : string;
  };
  message: string;
}
