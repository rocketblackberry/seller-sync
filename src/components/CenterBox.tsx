type CenterBoxProps = {
  children: React.ReactNode;
};

export default function CenterBox({ children }: CenterBoxProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {children}
    </div>
  );
}
