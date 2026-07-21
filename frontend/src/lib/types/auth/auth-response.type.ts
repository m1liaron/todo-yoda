import { User } from "../user";

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export { type AuthResponse };