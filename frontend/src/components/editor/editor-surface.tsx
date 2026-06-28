"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EditorSurfaceProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const EditorSurface = React.forwardRef<HTMLDivElement, EditorSurfaceProps>(
  ({ value, onChange, placeholder = "Start writing your story…", className }, forwardedRef) => {
    const innerRef = React.useRef<HTMLDivElement>(null);
    const isFirstRender = React.useRef(true);

    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (isFirstRender.current && innerRef.current) {
        innerRef.current.innerHTML = value;
        isFirstRender.current = false;
      }
    }, [value]);

    return (
      <div
        ref={innerRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        data-placeholder={placeholder}
        className={cn(
          "prose-ink min-h-[420px] outline-none",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-text-tertiary",
          className
        )}
      />
    );
  }
);
EditorSurface.displayName = "EditorSurface";
