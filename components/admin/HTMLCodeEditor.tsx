"use client";

import Editor from "@monaco-editor/react";

interface HTMLCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

/**
 * Thin wrapper around Monaco Editor for HTML editing.
 * Uses direct import (like canvas EditorPanel) to avoid
 * issues with next/dynamic wrapping Monaco's complex module.
 *
 * Note: globals.css section rules are scoped to #snap-container
 * so Monaco's internal <section> wrapper is not affected.
 */
export default function HTMLCodeEditor({
  value,
  onChange,
  height = "280px",
}: HTMLCodeEditorProps) {
  return (
    <Editor
      height={height}
      language="html"
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v || "")}
      onMount={(editor) => {
        // Force layout recalculation (fixes blank editor in modals)
        setTimeout(() => editor.layout(), 50);
        setTimeout(() => editor.layout(), 200);
      }}
      options={{
        minimap: { enabled: false },
        lineNumbers: "on",
        fontSize: 13,
        wordWrap: "on",
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        formatOnPaste: true,
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        suggest: { showWords: false },
        padding: { top: 8 },
      }}
    />
  );
}
