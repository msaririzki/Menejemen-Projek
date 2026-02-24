"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Tulis deskripsi dengan Markdown (mendukung bold, italic, list, dll)...",
  minHeight = "min-h-[150px]",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20 focus-within:border-white/20 transition-colors">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")} className="w-full">
        <div className="flex items-center justify-between border-b border-white/10 px-3 bg-white/5">
          <TabsList className="bg-transparent h-10 p-0">
            <TabsTrigger
              value="write"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4"
            >
              Write
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4"
            >
              Preview
            </TabsTrigger>
          </TabsList>
          
          {/* Markdown Helper Icons (Decorative/Informative) */}
          <div className="hidden sm:flex text-muted-foreground gap-3 text-xs">
            <span title="Bold: **text**">**B**</span>
            <span className="italic" title="Italic: *text*">*I*</span>
            <span title="List: - item">- List</span>
          </div>
        </div>

        <TabsContent value="write" className="m-0 p-0 border-none outline-none">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-transparent border-0 focus-visible:ring-0 resize-y p-3 outline-none ${minHeight} text-sm`}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0 p-4 border-none outline-none prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-blue-400 hover:prose-a:text-blue-300">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Pratinjau kosong...</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
