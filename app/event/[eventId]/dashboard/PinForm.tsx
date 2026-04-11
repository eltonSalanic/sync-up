"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyDashboardPin } from "@/app/actions/dashboard";

export default function PinForm({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const [pin, setPin] = useState("");
  const router = useRouter();

  // Add eventId arg to action state
  const verifyPinWithEventId = verifyDashboardPin.bind(null, eventId);
  const [{ error, success }, verifyPin, pending] = useActionState(
    verifyPinWithEventId,
    {
      success: false,
    },
  );

  if (success) {
    router.refresh();
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto min-h-[60vh]">
      <Card className="w-full border-border bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-primary size-7" />
          </div>
          <CardTitle className="font-main text-2xl font-bold tracking-tight">
            Admin Dashboard
          </CardTitle>
          <CardDescription className="font-main text-balance mt-2">
            Enter the 4-digit PIN for{" "}
            <span className="font-semibold text-foreground">{eventName}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={verifyPin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Label htmlFor="pin" className="sr-only">
                PIN
              </Label>
              <Input
                id="pin"
                name="pin"
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
                }}
                className={`text-center text-3xl tracking-[0.5em] font-mono h-16 bg-background/50 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                autoFocus
                disabled={pending}
              />
              {error && (
                <p className="text-sm text-destructive font-main font-medium text-center">
                  {error?.pin?.[0] || "Incorrect PIN or an error has occurred"}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 font-main text-base group"
              disabled={pending || pin.length !== 4}
            >
              {pending ? (
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
