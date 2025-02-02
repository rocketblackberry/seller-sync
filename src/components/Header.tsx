import { User } from "@nextui-org/react";
import { LuCircleDollarSign } from "react-icons/lu";
import { useUser } from "@auth0/nextjs-auth0/client";
import Login from "./Login";
import useExchangeRate from "@/hooks/useExchangeRate";

export default function Header() {
  const { user } = useUser();
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
