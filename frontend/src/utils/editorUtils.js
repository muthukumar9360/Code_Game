/**
 * Advanced IDE Keyboard Handler for Code Editor Textareas:
 * - Tab: Indents with 4 spaces (multi-line indent support)
 * - Shift+Tab: Outdents by 4 spaces (multi-line outdent support)
 * - Enter: Maintains indentation (auto-indent), auto-expands brackets like {|} into new line with extra indent
 * - Brackets & Quotes Auto-Close: (), [], {}, "", '', ``
 * - Selection wrap: Typing brackets/quotes around selected text wraps it
 * - Auto-Skip: Typing closing bracket/quote when next character is already that closing character skips past it
 * - Backspace Pair Deletion: Deletes matching empty bracket/quote pairs in one stroke
 */

export const handleEditorKeyDown = (e, code, setCode) => {
  const { key, shiftKey } = e;
  const textarea = e.target;
  const { selectionStart: start, selectionEnd: end, value } = textarea;

  const pairs = {
    "(": ")",
    "[": "]",
    "{": "}",
    '"': '"',
    "'": "'",
    "`": "`"
  };

  const closingChars = [")", "]", "}", '"', "'", "`"];

  // 1. TAB & SHIFT+TAB (MAINTAIN SPACES / INDENT / OUTDENT)
  if (key === "Tab") {
    e.preventDefault();
    if (start === end) {
      if (!shiftKey) {
        // Simple 4-space indent at cursor
        const newCode = value.substring(0, start) + "    " + value.substring(end);
        setCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      } else {
        // Shift+Tab without selection: remove up to 4 spaces before cursor
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const lineBeforeCursor = value.substring(lineStart, start);
        const match = lineBeforeCursor.match(/( {1,4})$/);
        if (match) {
          const removeLen = match[1].length;
          const newCode = value.substring(0, start - removeLen) + value.substring(start);
          setCode(newCode);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - removeLen;
          }, 0);
        }
      }
    } else {
      // Multi-line selection indent/outdent
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      let lineEnd = value.indexOf("\n", end);
      if (lineEnd === -1) lineEnd = value.length;

      const lines = value.substring(lineStart, lineEnd).split("\n");
      if (!shiftKey) {
        // Indent all lines
        const newLines = lines.map(line => "    " + line);
        const replacement = newLines.join("\n");
        const newCode = value.substring(0, lineStart) + replacement + value.substring(lineEnd);
        setCode(newCode);
        const added = lines.length * 4;
        setTimeout(() => {
          textarea.selectionStart = start + 4;
          textarea.selectionEnd = end + added;
        }, 0);
      } else {
        // Outdent all lines
        let removedFirst = 0;
        let totalRemoved = 0;
        const newLines = lines.map((line, idx) => {
          const match = line.match(/^ {1,4}/);
          if (match) {
            const count = match[0].length;
            if (idx === 0) removedFirst = count;
            totalRemoved += count;
            return line.substring(count);
          }
          return line;
        });
        const replacement = newLines.join("\n");
        const newCode = value.substring(0, lineStart) + replacement + value.substring(lineEnd);
        setCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = Math.max(lineStart, start - removedFirst);
          textarea.selectionEnd = Math.max(lineStart, end - totalRemoved);
        }, 0);
      }
    }
    return;
  }

  // 2. AUTO-INDENT & BRACKET AUTO-EXPAND ON ENTER
  if (key === "Enter") {
    e.preventDefault();
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const currentLine = value.substring(lineStart, start);
    const indentMatch = currentLine.match(/^[ \t]*/);
    const currentIndent = indentMatch ? indentMatch[0] : "";

    const charBefore = value[start - 1];
    const charAfter = value[start];

    // Check if pressing enter between an open and close bracket pair: {|} or (|) or [|]
    const isBracketPair =
      (charBefore === "{" && charAfter === "}") ||
      (charBefore === "(" && charAfter === ")") ||
      (charBefore === "[" && charAfter === "]");

    if (isBracketPair) {
      const extraIndent = currentIndent + "    ";
      const insertion = "\n" + extraIndent + "\n" + currentIndent;
      const newCode = value.substring(0, start) + insertion + value.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + extraIndent.length;
      }, 0);
      return;
    }

    // Check if current line ends with a block initiator like { or : or ( or [
    const trimmedBefore = currentLine.trimEnd();
    const shouldAddIndent =
      trimmedBefore.endsWith("{") ||
      trimmedBefore.endsWith(":") ||
      trimmedBefore.endsWith("(") ||
      trimmedBefore.endsWith("[");

    const newIndent = shouldAddIndent ? currentIndent + "    " : currentIndent;
    const newCode = value.substring(0, start) + "\n" + newIndent + value.substring(end);
    setCode(newCode);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length;
    }, 0);
    return;
  }

  // 3. AUTO-SKIP CLOSING BRACKET / QUOTE
  if (closingChars.includes(key) && start === end && value[start] === key) {
    // If next character is already the typed closing character, skip past it
    e.preventDefault();
    textarea.selectionStart = textarea.selectionEnd = start + 1;
    return;
  }

  // 4. BRACKETS & QUOTES AUTO-CLOSE AND SELECTION WRAPPING
  if (pairs[key]) {
    e.preventDefault();
    const closeChar = pairs[key];

    if (start !== end) {
      // Selection wrapping: wrap selected code in brackets or quotes
      const selectedText = value.substring(start, end);
      const wrapped = key + selectedText + closeChar;
      const newCode = value.substring(0, start) + wrapped + value.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
      }, 0);
    } else {
      // Auto-insert closing pair and place cursor between them
      const newCode = value.substring(0, start) + key + closeChar + value.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
    return;
  }

  // 5. BACKSPACE DELETION OF MATCHED EMPTY PAIRS
  if (key === "Backspace" && start === end && start > 0) {
    const charBefore = value[start - 1];
    const charAfter = value[start];

    if (
      (charBefore === "{" && charAfter === "}") ||
      (charBefore === "(" && charAfter === ")") ||
      (charBefore === "[" && charAfter === "]") ||
      (charBefore === '"' && charAfter === '"') ||
      (charBefore === "'" && charAfter === "'") ||
      (charBefore === "`" && charAfter === "`")
    ) {
      e.preventDefault();
      const newCode = value.substring(0, start - 1) + value.substring(start + 1);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start - 1;
      }, 0);
      return;
    }
  }
};
