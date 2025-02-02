import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { AuthUser, User } from "@/interfaces";

export default function useAuth() {
  const {
    user: auth0User,
    isLoading: auth0Loading,
    error: auth0Error,
  } = useUser();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (auth0User?.sub) {
        try {
          const response = await fetch(`/api/users/${auth0User.sub}`);
          if (!response.ok) {
            throw new Error("Failed to fetch user");
          }
          const data: User = await response.json();
          setUser({
            ...data,
            nickname: auth0User.nickname || "",
            picture: auth0User.picture || "",
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (!auth0Loading) {
      fetchUser();
    }
  }, [auth0User, auth0Loading]);

  return { user, loading: loading || auth0Loading, error: error || auth0Error };
}
