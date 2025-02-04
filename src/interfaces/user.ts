/** ロール */
export type Role = "admin" | "user";

/** ステータス */
export type Status = "active" | "inactive" | "deleted";

/** ユーザー */
export interface User {
  id: number;
  sub: string;
  email: string;
  role: Role;
  status: Status;
  created_at: Date;
  updated_at: Date;
}

/** 認証済ユーザー */
export interface AuthUser {
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
