import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gem } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface SapphireClaimProps {
  currentClaimed?: number;
  maxDaily?: number;
  onClaim?: () => void;
}

export default function SapphireClaim({
  currentClaimed = 0,
  maxDaily = 10,
  onClaim = () => console.log("Claim triggered"),
}: SapphireClaimProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(currentClaimed);
  const { toast } = useToast();

  const handleClaim = async () => {
    if (claimed >= maxDaily) {
      toast({
        title: "Daily limit reached",
        description: "You've claimed all your sapphires for today. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }

    setClaiming(true);
    
    try {
      const response = await fetch("/api/sapphire/claim", {
        method: "POST",
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Claim failed",
          description: data.message || "Failed to claim sapphire",
          variant: "destructive",
        });
        setClaiming(false);
        return;
      }
      
      setClaimed(data.dailyClaimed);
      setClaiming(false);
      onClaim();
      toast({
        title: "Sapphire claimed! 💎",
        description: `You now have ${data.dailyClaimed}/${maxDaily} sapphires for today.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim sapphire. Please try again.",
        variant: "destructive",
      });
      setClaiming(false);
    }
  };

  const progress = (claimed / maxDaily) * 100;
  const canClaim = claimed < maxDaily;

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sapphire/10">
            <Gem className="w-12 h-12 text-sapphire" />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2">Claim Your Sapphire</h2>
            <p className="text-muted-foreground">
              You can claim {maxDaily} sapphires every 24 hours
            </p>
          </div>

          <div className="space-y-3">
            <Progress value={progress} className="h-4" />
            <p className="text-4xl font-bold text-sapphire" data-testid="text-claim-progress">
              {claimed} / {maxDaily}
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleClaim}
            disabled={!canClaim || claiming}
            className="w-full"
            data-testid="button-claim-sapphire"
          >
            {claiming ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Claiming...
              </span>
            ) : canClaim ? (
              "Claim Now"
            ) : (
              "Daily Limit Reached"
            )}
          </Button>

          {!canClaim && (
            <p className="text-sm text-muted-foreground">
              Resets in 14h 23m
            </p>
          )}

          <div className="pt-4 border-t border-dashed border-border">
            <p className="text-xs text-muted-foreground">
              Ad space (appears during claim animation when integrated)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
