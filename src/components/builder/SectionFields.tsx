"use client";

import { useState } from "react";
import { ImageIcon, Loader2, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getComponentDef, type FieldDef } from "@/lib/components/catalog";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { uploadToBucket } from "@/lib/storage";
import type { Section } from "@/types/promotion";

/** 선택된 섹션의 필드 스키마(부록 A)에 따라 동적 폼 렌더 (SCR-07) */
export function SectionFields({
  section,
  onChange,
}: {
  section: Section;
  onChange: (content: Record<string, unknown>) => void;
}) {
  const def = getComponentDef(section.componentType);
  if (!def) return null;
  const content = section.content as Record<string, unknown>;

  function set(key: string, value: unknown) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="flex flex-col gap-5">
      {def.fields.map((field) => (
        <FieldRow key={field.key} field={field}>
          <FieldControl
            field={field}
            value={content[field.key]}
            onChange={(v) => set(field.key, v)}
          />
        </FieldRow>
      ))}
    </div>
  );
}

function FieldRow({
  field,
  children,
}: {
  field: FieldDef;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{field.label}</span>
      {children}
    </label>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full rounded-input border border-border bg-surface px-4 py-2 text-sm placeholder:text-text-sub focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      );
    case "date":
      return (
        <Input
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "image":
      return (
        <ImageField value={(value as string) ?? ""} onChange={onChange} />
      );
    case "list":
      return (
        <ListEditor
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );
    default:
      return (
        <Input
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
}

function ListEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="h-10"
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="text-text-sub hover:text-red-500"
            aria-label="삭제"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        className="flex items-center gap-1 self-start text-sm text-primary hover:underline"
      >
        <Plus className="h-4 w-4" /> 항목 추가
      </button>
    </div>
  );
}

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = getBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");
      const { publicUrl } = await uploadToBucket(
        supabase,
        "assets",
        user.id,
        file,
        { contentType: file.type },
      );
      onChange(publicUrl);
    } catch {
      setError("이미지 업로드에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-input border border-border bg-bg">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-text-sub" />
          )}
        </div>
        <label
          className={cn(
            "cursor-pointer rounded-input border border-border bg-surface px-3 py-2 text-sm hover:bg-bg",
            busy && "pointer-events-none opacity-60",
          )}
        >
          {busy ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" /> 업로드 중...
            </span>
          ) : (
            "이미지 파일을 추가해주세요."
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-text-sub hover:text-red-500"
          >
            제거
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
