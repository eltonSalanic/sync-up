"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CopyLinkClient({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input value={url} readOnly className="flex-1 text-sm" />
      <Button onClick={handleCopy} variant="secondary" className="shrink-0">
        {copied ? (
          <Check className="h-4 w-4 mr-2 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}
