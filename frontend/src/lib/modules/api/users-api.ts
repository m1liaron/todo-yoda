import { User } from "../../types/user";
import { request } from "./api";

const usersApi = {
  getMe: () => request<User>('/users/me', {}),
};


export { usersApi };