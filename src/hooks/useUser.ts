import { User } from "@/interfaces";
import { useUser as useAuth0User } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";

// ユーザーデータのキャッシュを保持するオブジェクト
const userCache: { [key: string]: User } = {};

/**
 * カスタムフック useUser
 *
 * Auth0 のクライアントフックを利用してユーザー情報を取得し、バックエンド API から
 * ユーザーの詳細情報を取得して状態として管理します。
 *
 * @returns { user, loading, error } - ユーザー情報、読み込み状態、エラーメッセージ
 */
export default function useUser() {
  // Auth0 のユーザー情報を取得
  const {
    user: auth0User,
    isLoading: auth0Loading,
    error: auth0Error,
  } = useAuth0User();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (auth0User?.sub) {
        // キャッシュをチェック
        if (userCache[auth0User.sub]) {
          setUser(userCache[auth0User.sub]);
          setLoading(false);
          return;
        }

        try {
          // API からユーザーの詳細情報を取得
          const response = await fetch(`/api/users/${auth0User.sub}`);

          if (!response.ok) {
            throw new Error("Failed to fetch user");
          }

          const data: User = await response.json();

          // Auth0 のユーザー情報（nickname, picture など）をマージ
          const mergedUser = {
            ...data,
            nickname: auth0User.nickname || "",
            picture: auth0User.picture || "",
          };

          // キャッシュに保存
          userCache[auth0User.sub] = mergedUser;

          setUser(mergedUser);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (!auth0Loading && !auth0Error && auth0User) {
      fetchUser();
    }
  }, [auth0User, auth0Loading, auth0Error]);

  return { user, loading, error };
}
