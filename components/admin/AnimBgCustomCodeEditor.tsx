"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

interface AnimBgCustomCodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

const STARTER_TEMPLATE = `// Custom Animation Code
// ─────────────────────────────────────────────────────────────
// Available globals:
//   anime(opts)    — anime.js v3-style: anime({ targets, ...props })
//   animate(t, p)  — anime.js v4-style: animate(targets, props)
//   container      — HTMLElement (your layer div, position:absolute, inset:0)
//
// You MUST return { pause, resume, destroy }
// ─────────────────────────────────────────────────────────────

const shapes = [];
const colors = ['#4ecdc4', '#6a82fb', '#fc466b'];

for (let i = 0; i < 6; i++) {
  const el = document.createElement('div');
  const size = 40 + Math.random() * 80;
  el.style.cssText = [
    'position:absolute',
    \`width:\${size}px\`,
    \`height:\${size}px\`,
    \`left:\${Math.random() * 90}%\`,
    \`top:\${Math.random() * 90}%\`,
    \`background:\${colors[i % colors.length]}33\`,
    'border-radius:50%',
    \`filter:blur(\${8 + Math.random() * 12}px)\`,
  ].join(';');
  container.appendChild(el);
  shapes.push(el);
}

// anime() uses v3-style API (easing, direction, loop, delay all work)
const anims = shapes.map((el, i) =>
  anime({
    targets: el,
    translateX: [anime.random(-60, 60), anime.random(-60, 60)],
    translateY: [anime.random(-60, 60), anime.random(-60, 60)],
    opacity: [0.2, 0.7],
    loop: true,
    direction: 'alternate',
    duration: 6000 + i * 800,
    easing: 'easeInOutSine',
    delay: i * 300,
  })
);

return {
  pause:   () => anims.forEach(a => a.pause()),
  resume:  () => anims.forEach(a => a.play()),
  destroy: () => { anims.forEach(a => a.pause()); shapes.forEach(el => el.remove()); },
};`;

export default function AnimBgCustomCodeEditor({ code, onChange }: AnimBgCustomCodeEditorProps) {
  const [fullScreen, setFullScreen] = useState(false);

  const handleMount = (editor: any) => {
    setTimeout(() => editor.layout(), 50);
    setTimeout(() => editor.layout(), 200);
  };

  const editorHeight = fullScreen ? "calc(100vh - 120px)" : "320px";

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <label className="form-label fw-semibold mb-0 small">
          <i className="bi bi-code-slash me-1" />
          Animation Code (Anime.js + DOM)
        </label>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => onChange(STARTER_TEMPLATE)}
            title="Reset to starter template"
          >
            <i className="bi bi-arrow-counterclockwise me-1" />
            Reset
          </button>
          <button
            type="button"
            className={`btn btn-sm ${fullScreen ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFullScreen(!fullScreen)}
            title={fullScreen ? "Exit full screen" : "Full screen editor"}
          >
            <i className={`bi ${fullScreen ? "bi-fullscreen-exit" : "bi-fullscreen"} me-1`} />
            {fullScreen ? "Shrink" : "Expand"}
          </button>
        </div>
      </div>

      {fullScreen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#1e1e1e", display: "flex", flexDirection: "column", padding: "16px" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-white mb-0">
              <i className="bi bi-code-slash me-2" />
              Custom Animation Code
            </h6>
            <button className="btn btn-outline-light btn-sm" onClick={() => setFullScreen(false)}>
              <i className="bi bi-x-lg me-1" />Close
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <Editor
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={code || STARTER_TEMPLATE}
              onChange={(v) => onChange(v || "")}
              onMount={handleMount}
              options={{ minimap: { enabled: true }, lineNumbers: "on", fontSize: 13, wordWrap: "on", scrollBeyondLastLine: false, tabSize: 2 }}
            />
          </div>
        </div>
      )}

      {!fullScreen && (
        <Editor
          height={editorHeight}
          language="javascript"
          theme="vs-dark"
          value={code || STARTER_TEMPLATE}
          onChange={(v) => onChange(v || "")}
          onMount={handleMount}
          options={{ minimap: { enabled: false }, lineNumbers: "on", fontSize: 12, wordWrap: "on", scrollBeyondLastLine: false, tabSize: 2 }}
        />
      )}

      <div className="mt-2 p-2 rounded" style={{ background: "#1e1e1e", fontSize: "0.72rem", color: "#9da5b4" }}>
        <i className="bi bi-info-circle me-1" />
        Available globals: <code className="text-info">anime({"{ targets, ...props }"})</code> (v3-style),{" "}
        <code className="text-info">animate(targets, props)</code> (v4-style),{" "}
        <code className="text-info">container</code> (HTMLElement).{" "}
        Must return <code className="text-success">{"{ pause, resume, destroy }"}</code>.{" "}
        <span className="text-warning">Admin-only feature — code runs live on the page.</span>
      </div>
    </div>
  );
}
