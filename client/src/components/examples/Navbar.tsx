import Navbar from "../Navbar";

export default function NavbarExample() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-4">Unauthenticated State:</p>
        <Navbar />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-4">Authenticated User:</p>
        <Navbar isAuthenticated userEmail="john@example.com" sapphireBalance={7} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-4">Admin User:</p>
        <Navbar isAuthenticated isAdmin userEmail="admin@hp-hosting.com" sapphireBalance={100} />
      </div>
    </div>
  );
}
