import React, { useRef, useMemo } from "react";
import { highlightCode } from "../utils/syntaxHighlighter.js";
import { handleEditorKeyDown } from "../utils/editorUtils.js";

/**
 * Premium IDE Code Editor with Syntax Color Highlighting:
 * - Data Types: Cyan / Sky Blue
 * - Functions: Bright Yellow
 * - Keywords: Purple
 * - Strings: Emerald Green
 * - Numbers: Orange
 * - Comments: Muted Slate Gray (Italic)
 * - Built-ins: Rose Red
 * - Keyboard features: Tab (4 spaces), Auto-Indent, Auto-Close Brackets/Quotes, Pair Deletion
 * - Synchronized Line Numbers Gutter
 */
const CodeEditor = ({
  value = "",
  onChange,
  language = "python",
  placeholder = "Write your algorithmic solution here...",
  className = "",
  onPaste,
  onCopy,
  readOnly = false
}) => {
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const lineGutterRef = useRef(null);

  // Memoize highlighted HTML to maximize typing responsiveness
  const highlightedHtml = useMemo(() => {
    return highlightCode(value, language);
  }, [value, language]);

  // Compute line numbers based on line breaks
  const lines = useMemo(() => {
    const count = (value || "").split("\n").length;
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1);
  }, [value]);

  // Synchronize scroll offsets between textarea, syntax layer, and line number gutter
  const handleScroll = (e) => {
    const { scrollTop, scrollLeft } = e.target;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (lineGutterRef.current) {
      lineGutterRef.current.scrollTop = scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    handleEditorKeyDown(e, value, onChange);
  };

  return (
    <div
      className={`relative w-full h-full flex bg-[#050b10] font-mono text-xs sm:text-sm overflow-hidden select-text ${className}`}
    >
      {/* LINE NUMBERS GUTTER */}
      <div
        ref={lineGutterRef}
        aria-hidden="true"
        className="w-10 sm:w-12 py-4 bg-[#03070b]/90 border-r border-white/5 select-none overflow-hidden shrink-0 text-right pr-2.5 text-gray-600 font-mono text-xs leading-[24px]"
      >
        {lines.map((num) => (
          <div key={num} className="h-[24px] leading-[24px]">
            {num}
          </div>
        ))}
      </div>

      {/* DUAL-LAYER CODE WORKSPACE */}
      <div className="relative flex-1 h-full overflow-hidden">
        {/* SYNTAX HIGHLIGHTED PRE LAYER (LAYER 0 - UNDERNEATH) */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 m-0 p-4 font-mono text-xs sm:text-sm leading-[24px] whitespace-pre overflow-hidden pointer-events-none text-white selection:bg-orange-500/30 font-medium"
          style={{ tabSize: 4 }}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />

        {/* INTERACTIVE TRANSPARENT TEXTAREA (LAYER 1 - ON TOP) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onPaste={onPaste}
          onCopy={onCopy}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder={placeholder}
          className="absolute inset-0 w-full h-full m-0 p-4 font-mono text-xs sm:text-sm leading-[24px] whitespace-pre text-transparent caret-orange-400 bg-transparent resize-none outline-none border-none overflow-auto custom-scrollbar selection:bg-orange-500/30 selection:text-transparent placeholder:text-gray-600 font-medium"
          style={{ tabSize: 4 }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
