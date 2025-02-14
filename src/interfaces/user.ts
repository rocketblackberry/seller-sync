/** ロール */
export type Role = "admin" | "user";

/** ステータス */
export type UserStatus = "active" | "inactive" | "deleted";

/** Auth0ユーザー */
export interface Auth0User {
  id: number;
  sub: string;
  email: string;
  role: Role;
  status: UserStatus;
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
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}
