import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Gem, Shield, Zap, Clock, Server } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Deploy Your WhatsApp Bot <br />
              <span className="text-sapphire">in Seconds</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              HP Hosting provides powerful tools to create and manage automated WhatsApp bot servers using Docker containers. Deploy, monitor, and scale with ease.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" data-testid="button-get-started">
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" data-testid="button-learn-more">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-card/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose HP Hosting?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="w-12 h-12 bg-sapphire/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-sapphire" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast Deployment</h3>
                <p className="text-muted-foreground">
                  Deploy your WhatsApp bot in seconds with our automated Docker container system. No complex setup required.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-sapphire/10 rounded-lg flex items-center justify-center mb-4">
                  <Gem className="w-6 h-6 text-sapphire" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sapphire Rewards System</h3>
                <p className="text-muted-foreground">
                  Claim free sapphires daily to deploy and manage your bots. No credit card required to get started.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-sapphire/10 rounded-lg flex items-center justify-center mb-4">
                  <Server className="w-6 h-6 text-sapphire" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
                <p className="text-muted-foreground">
                  View live logs, manage bot status, and control your deployments from one powerful dashboard.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-sapphire/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-sapphire" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
                <p className="text-muted-foreground">
                  Your bots run continuously on reliable infrastructure with automated restart and recovery.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-sapphire/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-sapphire" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Isolated</h3>
                <p className="text-muted-foreground">
                  Each bot runs in its own isolated Docker container with dedicated session management and data storage.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-sapphire/10 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-sapphire" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
                <p className="text-muted-foreground">
                  Start, stop, restart, or delete your bots with a single click. Full control at your fingertips.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <footer className="border-t py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-6 justify-center items-center">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">
                Privacy Policy
              </Link>
              <a href="mailto:olamilekanidowu998@gmail.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact-email">
                Contact Email
              </a>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              © 2024 HP Hosting (Horla Pookie Hosting). All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
