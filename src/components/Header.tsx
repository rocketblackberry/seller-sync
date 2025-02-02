import { User } from "@nextui-org/react";
import { LuCircleDollarSign } from "react-icons/lu";
import Login from "./Login";
import useAuth from "@/hooks/useAuth";
import useExchangeRate from "@/hooks/useExchangeRate";

export default function Header() {
  const { user } = useAuth();
  const { exchangeRate, loading, error } = useExchangeRate();

  return (
    <div className="flex items-center justify-between gap-8">
      <h1 className="font-bold">eBay Manager</h1>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-1">
          {<LuCircleDollarSign />}
          {exchangeRate}
        </div>
        {user ? (
          <User
            avatarProps={{
              src: user.picture || "",
              size: "sm",
            }}
            description={user.email}
            name={user.nickname}
          />
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
}
