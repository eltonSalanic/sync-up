"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeUserFromEvent } from "@/app/actions/dashboard";
import { ActionResult } from "@/app/types/ActionResult";

interface RemoveUserButtonProps {
  eventId: string;
  eventUserId: string;
  userName: string;
}

export default function RemoveUserButton({
  eventId,
  eventUserId,
  userName,
}: RemoveUserButtonProps) {
  const boundAction = removeUserFromEvent.bind(null, eventId, eventUserId);
  const [state, formAction, isPending] = useActionState<
    ActionResult<void>,
    FormData
  >(boundAction, {});

  function handleSubmit(e: React.FormEvent) {
    const confirmed = window.confirm(
      `Remove ${userName} from this event? Their availability will also be deleted.`,
    );
    if (!confirmed) e.preventDefault();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction} onSubmit={handleSubmit}>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive hover:text-secondary shrink-0 w-full sm:w-auto h-8 px-3"
          disabled={isPending}
        >
          <Trash2 className="size-3.5 mr-1.5" />
          {isPending ? "Removing..." : "Remove"}
        </Button>
      </form>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </div>
  );
}
