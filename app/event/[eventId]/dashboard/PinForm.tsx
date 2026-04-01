"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyDashboardPin } from "@/app/actions/dashboard";

export default function PinForm({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await verifyDashboardPin(eventId, pin);

    if (!result.success) {
      setError(result.error || "Incorrect PIN");
      setIsLoading(false);
    } else {
      router.refresh(); // Refresh the page to load dashboard content
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto min-h-[60vh]">
      <Card className="w-full border-border bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-primary size-7" />
          </div>
          <CardTitle className="font-main text-2xl font-bold tracking-tight">Admin Dashboard</CardTitle>
          <CardDescription className="font-main text-balance mt-2">
            Enter the 4-digit PIN for <span className="font-semibold text-foreground">{eventName}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Label htmlFor="pin" className="sr-only">PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoComplete="off"
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPin(val);
                  if (error) setError("");
                }}
                className={`text-center text-3xl tracking-[0.5em] font-mono h-16 bg-background/50 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                autoFocus
                disabled={isLoading}
              />
              {error && <p className="text-sm text-destructive font-main font-medium text-center">{error}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full h-12 font-main text-base group" disabled={isLoading || pin.length !== 4}>
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Unlock Dashboard
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
