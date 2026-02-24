"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  if (!content) {
    return <p className="text-muted-foreground italic text-sm">Tidak ada deskripsi.</p>;
  }

  return (
    <div className={`prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-headings:font-semibold prose-blockquote:border-l-blue-500 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
