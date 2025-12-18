export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="zen-background">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header section */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground">
              InnerCompass
            </h1>
            <p className="text-lg text-muted-foreground font-light">
              clarity in 60 seconds
            </p>
          </div>

          {/* Auth content (login/signup forms) */}
          {children}
        </div>
      </div>
    </div>
  );
}
