import AuthForm from "../AuthForm";

export default function AuthFormExample() {
  return (
    <div className="p-8 bg-background min-h-screen flex items-center">
      <div className="w-full space-y-8">
        <div>
          <p className="text-sm text-muted-foreground mb-4">Login Form:</p>
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
