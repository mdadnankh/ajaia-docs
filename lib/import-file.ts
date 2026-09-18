export const ALLOWED_IMPORT_EXTENSIONS = [".txt", ".md"] as const;
export const MAX_IMPORT_BYTES = 1_000_000;

export function isAllowedImportName(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ALLOWED_IMPORT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function titleFromFilename(filename: string): string {
  const cleaned = filename.replace(/\.(txt|md)$/i, "").trim();
  return cleaned || "Imported document";
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function plainTextToHtml(text: string): string {
  const blocks = text.replaceAll("\r\n", "\n").split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = escapeHtml(block.trim()).replaceAll("\n", "<br />");
      return `<p>${lines || "<br />"}</p>`;
    })
    .join("");
}

function inlineMarkdown(escapedLine: string): string {
  return escapedLine
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      html.push(listType === "ul" ? "</ul>" : "</ol>");
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    const ul = /^[-*]\s+(.+)$/.exec(line.trim());
    const ol = /^\d+\.\s+(.+)$/.exec(line.trim());

    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(escapeHtml(heading[2]))}</h${level}>`);
      continue;
    }

    if (ul) {
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${inlineMarkdown(escapeHtml(ul[1]))}</li>`);
      continue;
    }

    if (ol) {
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${inlineMarkdown(escapeHtml(ol[1]))}</li>`);
      continue;
    }

    closeList();
    if (line.trim() === "") continue;
    html.push(`<p>${inlineMarkdown(escapeHtml(line.trim()))}</p>`);
  }

  closeList();
  return html.join("") || "<p></p>";
}

export function importFileToHtml(filename: string, contents: string): {
  title: string;
  html: string;
} {
  const title = titleFromFilename(filename);
  if (filename.toLowerCase().endsWith(".md")) {
    return { title, html: markdownToHtml(contents) };
  }
  return { title, html: plainTextToHtml(contents) };
}

export function sanitizeDocumentHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}
