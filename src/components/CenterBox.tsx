type CenterBoxProps = {
  children: React.ReactNode;
};

export default function CenterBox({ children }: CenterBoxProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
  );
}
