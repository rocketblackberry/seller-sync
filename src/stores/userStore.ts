import { User } from "@/types";
import type { UserProfile } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { create } from "zustand";

type UserStore = {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (auth0User: UserProfile) => Promise<void>;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  fetchUser: async (auth0User) => {
    if (!auth0User?.sub) {
      set({ loading: false });
      return;
    }

    try {
      const { data } = await axios.get<User>(`/api/users/${auth0User.sub}`);

      const mergedUser = {
        ...data,
        nickname: auth0User.nickname || "",
        picture: auth0User.picture || "",
      };

      set({
        user: mergedUser,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: axios.isAxiosError(error)
          ? error.message
          : "ユーザー情報の取得に失敗しました",
        loading: false,
      });
    }
  },

  clearUser: () =>
    set({
      user: null,
      loading: false,
      error: null,
    }),
}));
