"use client";

import { useEffect, useRef, useState } from "react";
import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { cn } from "@/lib/utils";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/common/toolbar.css";
import "@milkdown/crepe/theme/common/top-bar.css";
// We want to load the frame theme which has full editor styles
import "@milkdown/crepe/theme/frame.css";

interface MilkdownEditorInnerProps {
  initialMarkdown: string;
  onMarkdownChange: (markdown: string) => void;
  readOnly?: boolean;
  onLoaded?: () => void;
  toolbarContainer?: HTMLDivElement | null;
}

function MilkdownEditorInner({
  initialMarkdown,
  onMarkdownChange,
  readOnly = false,
  onLoaded,
  toolbarContainer,
}: MilkdownEditorInnerProps) {
  const onMarkdownChangeRef = useRef(onMarkdownChange);
  const crepeRef = useRef<Crepe | null>(null);
  const [topBarNode, setTopBarNode] = useState<Element | null>(null);
  
  useEffect(() => {
    onMarkdownChangeRef.current = onMarkdownChange;
  }, [onMarkdownChange]);

  const { loading } = useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: initialMarkdown,
      features: {
        [Crepe.Feature.TopBar]: !readOnly,
      }
    });

    crepe.setReadonly(readOnly);
    crepe.editor.use(listener);

    crepe.editor.config((ctx) => {
      const lst = ctx.get(listenerCtx);
      lst.markdownUpdated((_, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) {
          onMarkdownChangeRef.current(markdown);
        }
      });
    });

    crepeRef.current = crepe;
    return crepe;
  }, []);

  useEffect(() => {
    if (!loading) {
      const node = document.querySelector(".milkdown-top-bar");
      setTopBarNode(node);
      if (onLoaded) {
        onLoaded();
      }
    }
  }, [loading, onLoaded]);
  // Safely teleport the top bar DOM element to the header portal container
  useEffect(() => {
    if (!toolbarContainer || !topBarNode) return;

    toolbarContainer.appendChild(topBarNode);

    return () => {
      if (toolbarContainer.contains(topBarNode)) {
        toolbarContainer.removeChild(topBarNode);
      }
    };
  }, [toolbarContainer, topBarNode]);

  return (
    <div className={cn(
      "milkdown-container prose max-w-none font-serif transition-colors relative",
      readOnly ? "min-h-0 border-none p-0" : "min-h-[400px] border-none p-0"
    )}>
      <Milkdown />
    </div>
  );
}

interface MilkdownEditorProps {
  initialMarkdown: string;
  onMarkdownChange: (markdown: string) => void;
  readOnly?: boolean;
  onLoaded?: () => void;
  toolbarContainer?: HTMLDivElement | null;
}

export default function MilkdownEditor({
  initialMarkdown,
  onMarkdownChange,
  readOnly = false,
  onLoaded,
  toolbarContainer,
}: MilkdownEditorProps) {
  return (
    <MilkdownProvider>
      <MilkdownEditorInner
        initialMarkdown={initialMarkdown}
        onMarkdownChange={onMarkdownChange}
        readOnly={readOnly}
        onLoaded={onLoaded}
        toolbarContainer={toolbarContainer}
      />
    </MilkdownProvider>
  );
}
