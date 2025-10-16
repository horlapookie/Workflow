import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CreateServerFormProps {
  onDeploy?: (data: { phone: string; prefix: string; sessionId: string }) => void;
  isDeploying?: boolean;
}

export default function CreateServerForm({
  onDeploy = (data) => console.log("Deploy bot with data:", data),
  isDeploying = false,
}: CreateServerFormProps) {
  const [phone, setPhone] = useState("");
  const [prefix, setPrefix] = useState(".");
  const [sessionId, setSessionId] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !sessionId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onDeploy({ phone, prefix, sessionId });
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Your Bot Server</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (with country code, no +)</Label>
          <Input
            id="phone"
            type="text"
            placeholder="2348012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="input-phone"
          />
          <p className="text-xs text-muted-foreground">
            Enter your WhatsApp number with country code, no spaces or + symbol
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prefix">Prefix</Label>
          <Input
            id="prefix"
            type="text"
            placeholder="."
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            data-testid="input-prefix"
          />
          <p className="text-xs text-muted-foreground">
            Command prefix for your bot (default is ".")
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sessionId">Session ID (Base64)</Label>
          <Textarea
            id="sessionId"
            placeholder="Paste your session ID here..."
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="font-mono text-sm h-32"
            data-testid="input-session-id"
          />
          <p className="text-xs text-muted-foreground">
            Your WhatsApp session ID in base64 format
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isDeploying}
          data-testid="button-deploy"
        >
          {isDeploying ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Deploying Bot...
            </span>
          ) : (
            "Deploy Bot"
          )}
        </Button>
      </form>
    </Card>
  );
}
