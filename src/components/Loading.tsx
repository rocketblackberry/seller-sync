import CenterBox from "@/components/CenterBox";
import { CircularProgress } from "@nextui-org/react";

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
      <a className="underline" href="/api/auth/login">
        Login please
      </a>
    </CenterBox>
  );
}
