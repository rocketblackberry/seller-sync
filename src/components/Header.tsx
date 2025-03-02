import { useExchangeRateStore } from "@/stores/exchangeRateStore";
import { useUserStore } from "@/stores/userStore";
import { User } from "@nextui-org/react";
import { LuCircleDollarSign } from "react-icons/lu";
import Seller from "./Seller";

export default function Header() {
  const { user } = useUserStore();
  const { exchangeRate } = useExchangeRateStore();

  const handleLogout = () => {
    if (!confirm("ログアウトしますか？")) return;

    window.location.href = "/api/auth/logout";
  };

  return (
    <div className="flex w-full items-center justify-between gap-8">
      <div className="flex items-center gap-8">
        <h1 className="shrink-0 font-bold">SellerSync</h1>
        <Seller />
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-1">
          {<LuCircleDollarSign />}
          {exchangeRate}
        </div>
        {user && (
          <User
            className="cursor-pointer"
            avatarProps={{
              src: user.picture || "",
              size: "sm",
            }}
            description={user.email}
            name={user.nickname}
            onClick={handleLogout}
          />
        )}
      </div>
    </div>
  );
}
