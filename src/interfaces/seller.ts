/** セラー */
export interface Seller {
  id: number;
  user_id: number;
  seller_id: string;
  name: string;
  access_token: string;
  refresh_token: string;
  created_at?: Date;
  updated_at?: Date;
}
