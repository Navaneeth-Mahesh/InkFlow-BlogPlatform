"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteBlogDialog({
  open,
  onOpenChange,
  title,
  deleting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  deleting: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete this story?</DialogTitle>
          <DialogDescription>
            This can&apos;t be undone. &ldquo;{title}&rdquo; will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="coral" onClick={onConfirm} disabled={deleting} className="gap-1.5">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
