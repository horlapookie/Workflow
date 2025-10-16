import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1>Terms of Service</h1>
            <p className="text-muted-foreground">Effective Date: January 1, 2024</p>

            <p>
              Welcome to HP Hosting ("we," "our," "us"). By using our platform, you agree to the following Terms of Service (TOS) and acknowledge our Privacy Policy. If you do not agree, please do not use our services.
            </p>

            <h2>1. Overview</h2>
            <p>HP Hosting provides tools for users to:</p>
            <ul>
              <li>Create and manage automated bot servers using Docker containers.</li>
              <li>Deploy and monitor their own WhatsApp or similar bot applications.</li>
              <li>Manage their accounts, claim daily rewards ("Sapphire 💎"), and access an admin dashboard.</li>
            </ul>
            <p>You must be at least 13 years old (or the age of digital consent in your country) to use our services.</p>

            <h2>2. User Accounts</h2>
            <ul>
              <li>You must create an account using a valid email address.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You must not share or resell your account.</li>
              <li>You are responsible for all activities under your account.</li>
            </ul>

            <h2>3. Use of Services</h2>
            <p>Our platform allows you to deploy containerized bots to our VPS or your own server.</p>
            <p>You must comply with all applicable laws, including data protection and anti-spam regulations.</p>
            <p>You must not use HP Hosting for any of the following:</p>
            <ul>
              <li>Sending spam or unsolicited messages.</li>
              <li>Hosting harmful code, malware, or illegal content.</li>
              <li>Exploiting system vulnerabilities or attempting to gain unauthorized access.</li>
            </ul>
            <p>Violations may result in immediate account suspension or termination.</p>

            <h2>4. Daily Rewards (Sapphire 💎)</h2>
            <ul>
              <li>Each user can claim up to 10 Sapphire 💎 per day.</li>
              <li>Sapphire 💎 are in-platform credits only. They have no cash value and cannot be exchanged for money.</li>
              <li>Abuse of the claim system (e.g., using multiple accounts or bots) may result in loss of credits and/or account suspension.</li>
            </ul>

            <h2>5. Service Availability</h2>
            <ul>
              <li>We aim to provide reliable uptime but cannot guarantee uninterrupted access.</li>
              <li>Scheduled maintenance or unforeseen outages may occur.</li>
              <li>We are not liable for any losses due to downtime or service interruptions.</li>
            </ul>

            <h2>6. Termination</h2>
            <ul>
              <li>You may delete your account at any time.</li>
              <li>We may suspend or terminate your account if you violate these terms, engage in illegal activity, or attempt to disrupt or abuse our platform.</li>
              <li>Termination may result in loss of any Sapphire 💎 credits.</li>
            </ul>

            <h2>7. Limitation of Liability</h2>
            <ul>
              <li>HP Hosting is provided "AS IS" without warranties.</li>
              <li>We are not responsible for any damages, including loss of profits, data, or business interruptions.</li>
              <li>In no case shall our liability exceed the amount paid by you (if any) for using our services.</li>
            </ul>

            <h2>8. Changes to These Terms</h2>
            <p>
              We may update these Terms and Privacy Policy from time to time. Continued use of the platform after updates means you accept the revised terms.
            </p>

            <h2>9. Contact Information</h2>
            <p>For questions or concerns, contact us at:</p>
            <ul>
              <li>📧 Email: olamilekanidowu998@gmail.com</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
