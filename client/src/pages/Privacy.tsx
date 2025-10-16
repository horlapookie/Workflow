import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Privacy() {
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
            <h1>Privacy Policy</h1>
            <p className="text-muted-foreground">Effective Date: January 1, 2024</p>

            <p>
              HP Hosting ("we," "our," "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>

            <h2>1. Data We Collect</h2>
            <p>We collect the following information:</p>
            <ul>
              <li><strong>Account Data:</strong> Email, login details.</li>
              <li><strong>Usage Data:</strong> IP address, device info, logs of server deployments, actions taken within the dashboard.</li>
              <li><strong>Optional Data:</strong> Any configuration or session IDs you input for deploying your bots.</li>
            </ul>
            <p>We do not sell or rent your personal information to third parties.</p>

            <h2>2. How We Use Your Data</h2>
            <p>We use collected data to:</p>
            <ul>
              <li>Provide, maintain, and improve our services.</li>
              <li>Authenticate users and prevent abuse.</li>
              <li>Show analytics, improve features, and offer support.</li>
              <li>Send service-related notifications (e.g., account updates, alerts).</li>
            </ul>

            <h2>3. Cookies & Tracking</h2>
            <ul>
              <li>We use cookies to remember your login session and preferences.</li>
              <li>Third-party analytics (if enabled in the future) may also use cookies.</li>
            </ul>

            <h2>4. Data Security</h2>
            <ul>
              <li>We implement industry-standard measures to protect user data.</li>
              <li>However, no system is completely secure, and we cannot guarantee absolute security.</li>
              <li>Users are encouraged to use strong passwords and keep their credentials confidential.</li>
            </ul>

            <h2>5. Third-Party Services</h2>
            <ul>
              <li>Our service may integrate with third-party APIs or hosting providers (e.g., Docker Hub, VPS providers).</li>
              <li>We are not responsible for their policies or security practices.</li>
              <li>You should review the policies of any third-party service you use with HP Hosting.</li>
            </ul>

            <h2>6. User Content</h2>
            <ul>
              <li>You retain all rights to the bots and data you deploy via HP Hosting.</li>
              <li>You grant us a limited, non-exclusive right to run your bots as necessary to provide the service.</li>
              <li>We do not claim ownership of your content.</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access, update, or delete your personal data.</li>
              <li>Opt-out of non-essential communications.</li>
              <li>Request a copy of your data (data portability).</li>
            </ul>

            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Continued use of the platform after updates means you accept the revised policy.
            </p>

            <h2>10. Contact Information</h2>
            <p>For questions or concerns about your privacy, contact us at:</p>
            <ul>
              <li>📧 Email: olamilekanidowu998@gmail.com</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
