import { Status } from "./common";

/** セラー */
export interface Seller {
  id: number;
  user_id: number;
  seller_id: string;
  name: string;
  access_token: string;
  refresh_token: string;
  status?: Status;
  created_at?: Date;
  updated_at?: Date;
}
