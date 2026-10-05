/**
 * High-performance regex syntax highlighter for Code_Game:
 * Highlights Data Types, Functions, Keywords, Strings, Numbers, Comments, and Built-ins.
 * Supported languages: python, javascript, cpp, java, c.
 */

export const escapeHtml = (str) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Master regexes with capture groups:
// 1: Comments, 2: Strings, 3: Numbers, 4: Keywords, 5: Data Types, 6: Built-ins, 7: Functions
const REGEX_MAP = {
  python: /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b(?:def|return|if|elif|else|for|while|break|continue|import|from|as|class|pass|try|except|finally|raise|with|lambda|in|is|not|and|or|yield|global|nonlocal|assert|async|await)\b)|(\b(?:int|float|str|bool|list|dict|set|tuple|bytes|bytearray|range|complex|Any|Optional|Union|List|Dict|Set|Tuple)\b)|(\b(?:print|len|range|enumerate|zip|sum|min|max|sorted|abs|map|filter|input|open|isinstance|issubclass|type|id|True|False|None)\b)|(\b[a-zA-Z_]\w*(?=\s*\())/gm,

  javascript: /(\/\/.*$|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b(?:const|let|var|function|return|if|else|for|while|do|break|continue|import|from|export|default|class|extends|new|this|super|try|catch|finally|throw|switch|case|async|await|yield|typeof|instanceof|in|of|void|delete)\b)|(\b(?:Array|Object|Function|String|Number|Boolean|Symbol|BigInt|Promise|Map|Set|WeakMap|WeakSet|Date|RegExp|Error)\b)|(\b(?:console|window|document|Math|JSON|true|false|null|undefined|NaN|Infinity)\b)|(\b[a-zA-Z_]\w*(?=\s*\())/gm,

  cpp: /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b(?:return|if|else|for|while|do|break|continue|switch|case|default|class|struct|enum|union|new|delete|this|public|private|protected|virtual|override|friend|template|typename|using|namespace|inline|constexpr|static|const|volatile|extern|try|catch|throw|sizeof)\b)|(\b(?:int|float|double|char|void|bool|long|short|unsigned|signed|size_t|auto|string|vector|map|set|pair|unordered_map|unordered_set|queue|stack|deque|priority_queue|nullptr)\b)|(\b(?:std|cout|cin|endl|printf|scanf|malloc|free|memcpy|memset|true|false)\b)|(\b[a-zA-Z_]\w*(?=\s*\())/gm,

  java: /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b(?:public|private|protected|static|final|abstract|class|interface|enum|extends|implements|new|this|super|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|throws|import|package|synchronized|volatile|transient|native|instanceof)\b)|(\b(?:int|float|double|char|void|boolean|byte|short|long|String|Integer|Double|Boolean|Character|Long|Float|Byte|Short|List|ArrayList|Map|HashMap|Set|HashSet|Scanner|StringBuilder|StringBuffer|Queue|Stack|Deque|null)\b)|(\b(?:System|out|println|print|Math|true|false)\b)|(\b[a-zA-Z_]\w*(?=\s*\())/gm,

  c: /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b(?:return|if|else|for|while|do|break|continue|switch|case|default|struct|enum|union|sizeof|typedef|static|const|volatile|extern|inline)\b)|(\b(?:int|float|double|char|void|long|short|unsigned|signed|size_t|FILE|NULL)\b)|(\b(?:printf|scanf|malloc|free|memcpy|memset|strlen|strcmp|strcpy)\b)|(\b[a-zA-Z_]\w*(?=\s*\())/gm
};

export const highlightCode = (code, lang = "python") => {
  if (!code) return "";
  const langKey = (lang || "python").toLowerCase();
  const regex = REGEX_MAP[langKey] || REGEX_MAP.python;

  let lastIndex = 0;
  let html = "";
  let match;

  regex.lastIndex = 0;
  while ((match = regex.exec(code)) !== null) {
    const textBefore = code.substring(lastIndex, match.index);
    if (textBefore) {
      html += escapeHtml(textBefore);
    }

    const [fullMatch, comment, str, num, kw, type, builtin, fn] = match;

    if (comment) {
      // Comments: Slate Gray & Italic
      html += `<span style="color: #64748b; font-style: italic;">${escapeHtml(fullMatch)}</span>`;
    } else if (str) {
      // Strings: Bright Emerald Green
      html += `<span style="color: #4ade80;">${escapeHtml(fullMatch)}</span>`;
    } else if (num) {
      // Numbers: Amber / Orange
      html += `<span style="color: #fb923c;">${escapeHtml(fullMatch)}</span>`;
    } else if (kw) {
      // Control flow & Keywords: Purple / Violet
      html += `<span style="color: #c084fc; font-weight: 700;">${escapeHtml(fullMatch)}</span>`;
    } else if (type) {
      // Data Types: Bright Cyan / Sky Blue
      html += `<span style="color: #38bdf8; font-weight: 600;">${escapeHtml(fullMatch)}</span>`;
    } else if (builtin) {
      // Built-in standard library identifiers: Rose / Red
      html += `<span style="color: #fb7185; font-weight: 600;">${escapeHtml(fullMatch)}</span>`;
    } else if (fn) {
      // Function Names: Bright Yellow
      html += `<span style="color: #facc15; font-weight: 600;">${escapeHtml(fullMatch)}</span>`;
    } else {
      html += escapeHtml(fullMatch);
    }

    lastIndex = regex.lastIndex;
  }

  const remaining = code.substring(lastIndex);
  if (remaining) {
    html += escapeHtml(remaining);
  }

  // Ensure trailing newline renders matching height in <pre>
  if (code.endsWith("\n")) {
    html += " ";
  }

  return html;
};
