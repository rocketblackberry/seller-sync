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

  <CenterBox>
    <a className="underline" href="/api/auth/login">
      Please Login
    </a>
  </CenterBox>;
}
