import React, { useState, useRef, useLayoutEffect } from "react";
import { useMessages } from "@/contexts/MessagesContext";
import { ArrowUp } from "lucide-react";
import "./entry-box.css";

// Hook: returns true if the textarea's value renders as > 1 line
function useIsMultiline(textareaRef, value) {
  const [isMultiline, setIsMultiline] = useState(false);
  const mirrorRef = useRef(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el || typeof window === "undefined") return;

    // create mirror div
    const mirror = document.createElement("div");
    mirrorRef.current = mirror;
    document.body.appendChild(mirror);

    // basic mirror styling so it's invisible and offscreen but measured exactly
    Object.assign(mirror.style, {
      position: "absolute",
      top: "0",
      left: "-9999px",
      visibility: "hidden",
      whiteSpace: "pre-wrap",        // preserve newlines and wrapping
      wordWrap: "break-word",
      overflowWrap: "break-word",
      boxSizing: "border-box",
      padding: "0",                  // we'll copy computed padding below
      border: "0",
    });

    const cs = window.getComputedStyle(el);

    // Copy the font/spacing/box styles that affect layout
    const propsToCopy = [
      "fontSize",
      "fontFamily",
      "fontWeight",
      "fontStyle",
      "lineHeight",
      "letterSpacing",
      "textTransform",
      "textIndent",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "boxSizing",
      "borderLeftWidth",
      "borderRightWidth",
      "borderTopWidth",
      "borderBottomWidth",
    ];
    propsToCopy.forEach((p) => {
      // Some computedStyle properties are kebab-case in CSS but camelCase on style object
      const k = p.replace(/([A-Z])/g, "-$1").toLowerCase();
      if (cs[p]) mirror.style[p] = cs[p];
      else if (cs.getPropertyValue(k)) mirror.style.setProperty(k, cs.getPropertyValue(k));
    });

    // Helper update function
    const update = () => {
      // Keep mirror width in sync with textarea (content width matters for wrapping)
      mirror.style.width = `${el.clientWidth}px`;

      // To measure a single line height reliably, put one visible char
      mirror.textContent = "x";
      const singleLineHeight = mirror.scrollHeight || 1;

      // Put the actual content. Append a zero-width char to force correct trailing-newline handling.
      mirror.textContent = (value && value.length) ? value + "\u200b" : "x";

      const contentHeight = mirror.scrollHeight || 0;

      // number of lines (rounding handles subpixel differences)
      const lines = Math.ceil(contentHeight / singleLineHeight);

      setIsMultiline(lines > 1);
    };

    // Initial measurement
    update();

    // Observe size changes (width, font changes on resize)
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // Also update on window resize (covers general layout changes)
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      mirror.remove();
    };
  }, [textareaRef, value]);

  return isMultiline;
}

export default function EntryBox() {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);
  const { sendMessage } = useMessages();

  // use the hook: true iff the rendered content is multi-line
  const isExpanded = useIsMultiline(textareaRef, input);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="entry-box">
      <textarea
        ref={textareaRef}
        className={`entry-input ${isExpanded ? "expanded" : ""}`}
        placeholder="Ask anything"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}                // keep base height to a single line
        style={{ resize: "none", overflow: "auto" }}
      />
      <button className="send-button" onClick={handleSend}>
        <ArrowUp />
      </button>
    </div>
  );
}
