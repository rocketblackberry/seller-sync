# SellerSync データベース設計書

## テーブル一覧

| テーブル名 | 説明           |
| ---------- | -------------- |
| users      | ユーザー情報   |
| sellers    | eBayセラー情報 |
| items      | 商品情報       |
| exchanges  | 為替レート情報 |

## ENUMタイプ

### condition

- `new`: 新品
- `used`: 中古

### status

- `active`: 有効
- `inactive`: 無効
- `deleted`: 削除済み

### role

- `admin`: 管理者
- `user`: 一般ユーザー

## テーブル詳細

### users

ユーザー情報を管理するテーブル

| カラム名   | 型           | NULL | デフォルト        | キー | 説明                  |
| ---------- | ------------ | ---- | ----------------- | ---- | --------------------- |
| id         | BIGSERIAL    | NO   |                   | PK   | 自動採番ID            |
| sub        | VARCHAR(255) | YES  |                   | UQ   | Auth0のサブジェクトID |
| email      | VARCHAR(255) | YES  |                   | UQ   | メールアドレス        |
| role       | role         | YES  |                   |      | ユーザー権限          |
| status     | status       | YES  | 'active'          |      | アカウント状態        |
| created_at | TIMESTAMP    | YES  | CURRENT_TIMESTAMP |      | 作成日時              |
| updated_at | TIMESTAMP    | YES  | CURRENT_TIMESTAMP |      | 更新日時              |

### sellers

eBayセラー情報を管理するテーブル

| カラム名      | 型           | NULL | デフォルト        | キー | 説明                     |
| ------------- | ------------ | ---- | ----------------- | ---- | ------------------------ |
| id            | BIGSERIAL    | NO   |                   | PK   | 自動採番ID               |
| user_id       | BIGINT       | YES  |                   | FK   | usersテーブルの外部キー  |
| seller_id     | VARCHAR(255) | YES  |                   | UQ   | eBayセラーID             |
| name          | VARCHAR(255) | YES  |                   |      | セラー名                 |
| access_token  | TEXT         | YES  |                   |      | eBayアクセストークン     |
| refresh_token | TEXT         | YES  |                   |      | eBayリフレッシュトークン |
| status        | status       | YES  | 'active'          |      | アカウント状態           |
| created_at    | TIMESTAMP    | YES  | CURRENT_TIMESTAMP |      | 作成日時                 |
| updated_at    | TIMESTAMP    | YES  | CURRENT_TIMESTAMP |      | 更新日時                 |

### items

商品情報を管理するテーブル

| カラム名       | 型           | NULL | デフォルト        | キー | 説明                      |
| -------------- | ------------ | ---- | ----------------- | ---- | ------------------------- |
| id             | VARCHAR(255) | NO   |                   | PK   | eBay商品ID                |
| seller_id      | BIGINT       | NO   |                   | FK   | sellersテーブルの外部キー |
| keyword        | VARCHAR(255) | YES  | ''                |      | 検索キーワード            |
| title          | VARCHAR(255) | YES  | ''                |      | 商品タイトル              |
| image          | VARCHAR(255) | YES  | ''                |      | 商品画像URL               |
| condition      | condition    | YES  | 'used'            |      | 商品状態                  |
| description    | TEXT         | YES  | ''                |      | 商品説明                  |
| description_ja | TEXT         | YES  | ''                |      | 商品説明（日本語）        |
| url            | TEXT         | YES  | ''                |      | 商品URL                   |
| price          | DECIMAL(7,2) | YES  | 0                 |      | 販売価格                  |
| cost           | INT          | YES  | 0                 |      | 仕入れ価格                |
| weight         | DECIMAL(3,1) | YES  | 1.0               |      | 重量(kg)                  |
| freight        | INT          | YES  | 0                 |      | 送料                      |
| profit         | INT          | YES  | 0                 |      | 利益                      |
| profit_rate    | DECIMAL(3,1) | YES  | 10.0              |      | 利益率(%)                 |
| fvf_rate       | DECIMAL(3,1) | YES  | 13.0              |      | 最終価値手数料率(%)       |
| promote_rate   | DECIMAL(3,1) | YES  | 2.0               |      | プロモーション手数料率(%) |
| stock          | INT          | YES  | 0                 |      | 在庫数                    |
| status         | status       | YES  | 'active'          |      | 商品状態                  |
| scrape_error   | INT          | YES  | 0                 |      | スクレイピングエラー回数  |
| imported_at    | TIMESTAMP    | YES  |                   |      | eBayからの取込日時        |
| scraped_at     | TIMESTAMP    | YES  |                   |      | スクレイピング日時        |
| synced_at      | TIMESTAMP    | YES  |                   |      | eBayへの同期日時          |
| created_at     | TIMESTAMP    | YES  | CURRENT_TIMESTAMP |      | 作成日時                  |
| updated_at     | TIMESTAMP    | YES  | CURRENT_TIMESTAMP |      | 更新日時                  |

### exchanges

為替レート情報を管理するテーブル

| カラム名      | 型           | NULL | デフォルト        | キー | 説明             |
| ------------- | ------------ | ---- | ----------------- | ---- | ---------------- |
| id            | BIGSERIAL    | NO   |                   | PK   | 自動採番ID       |
| from_currency | CHAR(3)      | NO   |                   |      | 変換元通貨コード |
| to_currency   | CHAR(3)      | NO   |                   |      | 変換先通貨コード |
| rate          | DECIMAL(5,2) | NO   |                   |      | 為替レート       |
| created_at    | TIMESTAMP    | YES  | CURRENT_TIMESTAMP |      | 作成日時         |
| updated_at    | TIMESTAMP    | YES  | CURRENT_TIMESTAMP |      | 更新日時         |

## インデックス

| テーブル名 | インデックス名                          | カラム                       |
| ---------- | --------------------------------------- | ---------------------------- |
| users      | users_sub_key                           | sub                          |
| users      | users_email_key                         | email                        |
| sellers    | sellers_seller_id_key                   | seller_id                    |
| sellers    | sellers_user_id_seller_id_key           | (user_id, seller_id)         |
| exchanges  | exchanges_from_currency_to_currency_key | (from_currency, to_currency) |
