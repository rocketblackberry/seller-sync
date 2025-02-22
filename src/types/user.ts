import { Status } from "./common";

/** ロール */
export type Role = "admin" | "user";

/** Auth0ユーザー */
export interface Auth0User {
  id: number;
  sub: string;
  email: string;
  role: Role;
  status: Status;
  created_at: Date;
  updated_at: Date;
}

/** ユーザー */
export interface User {
  id: number;
  sub: string;
  email: string;
  nickname: string;
  picture: string;
  role: Role;
  status: Status;
  created_at: Date;
  updated_at: Date;
}
