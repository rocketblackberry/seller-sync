import useAuth from "@/hooks/useAuth";
import useExchangeRate from "@/hooks/useExchangeRate";
import { User } from "@nextui-org/react";
import { LuCircleDollarSign } from "react-icons/lu";
import Seller from "./Seller";

export default function Header() {
  const { user } = useAuth();
  const { exchangeRate } = useExchangeRate();

  const handleLogout = () => {
    if (!confirm("ログアウトしますか？")) return;

    window.location.href = "/api/auth/logout";
  };

  return (
    <div className="flex items-center justify-between gap-8">
      <div className="flex items-center gap-8">
        <h1 className="shrink-0 font-bold">eBay Manager</h1>
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
