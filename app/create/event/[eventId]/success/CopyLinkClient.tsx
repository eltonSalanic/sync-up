"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CopyLinkClient({ eventId }: { eventId: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/create/anon-user?eventId=${eventId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Share Event</CardTitle>
        <CardDescription>
          Send this link to anyone you want to join your event.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center space-x-2">
        <Input value={shareUrl} readOnly className="flex-1" />
        <Button onClick={handleCopy} variant="secondary" className="shrink-0">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </CardContent>
    </Card>
  );
}
