import { Tokens } from "../../tokens.model";

export interface LoginResponse {
  tokens : Tokens
  message: string;
}
