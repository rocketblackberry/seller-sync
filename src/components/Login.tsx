"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Login() {
  const { user } = useUser();

  return (
    <div>
      {user ? (
        <div className="flex items-center space-x-4">
          <span>{user.name}</span>
          <Link href="/api/auth/logout">Logout</Link>
        </div>
      ) : (
        <Link href="/api/auth/login">Login</Link>
      )}
    </div>
  );
}
