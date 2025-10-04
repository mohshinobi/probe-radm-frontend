import { LoginInterface } from "./login.interface";

export interface UserInterface extends LoginInterface {
  id: string;
  username: string;
  roles: 'ROLE_ADMIN' | 'ROLE_OPERATOR' | 'ROLE_USER';
  role: 'ADMIN' | 'OPERATOR' | 'USER';
  enabled: boolean;
  authorized: boolean;
  firstConnection: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;

  canModifyRules: boolean;
  canActivateRules: boolean;
  dlulFiles: boolean;
  lastLogin: string;
}