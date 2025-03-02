import CenterBox from "@/components/CenterBox";
import { Button, CircularProgress } from "@nextui-org/react";
import Link from "next/link";

type LoadingProps = {
  loading: boolean;
  error: string | null;
};

export default function Loading({ loading, error }: LoadingProps) {
  if (error) return <CenterBox>{error || "Error"}</CenterBox>;

  if (loading)
    return (
      <CenterBox>
        <CircularProgress label="Loading..." />
      </CenterBox>
    );

  return (
    <CenterBox>
      <Button
        className="bg-black px-12 text-white"
        as={Link}
        href="/api/auth/login"
        variant="solid"
        radius="full"
      >
        ログイン
      </Button>
    </CenterBox>
  );
}
