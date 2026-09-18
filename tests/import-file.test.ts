import { describe, expect, it } from "vitest";
import {
  importFileToHtml,
  isAllowedImportName,
  markdownToHtml,
  plainTextToHtml,
  sanitizeDocumentHtml,
} from "../lib/import-file";

describe("file import", () => {
  it("only allows .txt and .md names", () => {
    expect(isAllowedImportName("notes.txt")).toBe(true);
    expect(isAllowedImportName("brief.md")).toBe(true);
    expect(isAllowedImportName("scan.pdf")).toBe(false);
    expect(isAllowedImportName("doc.docx")).toBe(false);
  });

  it("converts plain text paragraphs and escapes HTML", () => {
    const html = plainTextToHtml("Hello\n\n<script>x</script>");
    expect(html).toContain("<p>Hello</p>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("converts markdown headings, lists, and emphasis", () => {
    const html = markdownToHtml("# Title\n\n- one\n- two\n\n**bold** and *italic*");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("uses the filename as the document title", () => {
    const imported = importFileToHtml("Sprint notes.md", "# Hello");
    expect(imported.title).toBe("Sprint notes");
    expect(imported.html).toContain("<h1>Hello</h1>");
  });

  it("strips script tags from stored HTML", () => {
    expect(sanitizeDocumentHtml('<p>ok</p><script>alert(1)</script>')).toBe("<p>ok</p>");
  });
});
