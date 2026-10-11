"use client";

import { FileTextIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ACCEPTED_ID_DOCUMENT_TYPES, MAX_ID_DOCUMENT_BYTES } from "@/constants";
import { cn } from "@/lib/utils";

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function FileUploader({
  id,
  files,
  onChange,
  invalid,
}: {
  id?: string;
  files?: File[];
  onChange: (files: File[]) => void;
  invalid?: boolean;
}) {
  const file = files?.[0];
  const preview = useMemo(
    () => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file]
  );
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_ID_DOCUMENT_TYPES as unknown as Record<string, string[]>,
    maxSize: MAX_ID_DOCUMENT_BYTES,
    multiple: false,
    onDropAccepted: (accepted) => onChange(accepted.slice(0, 1)),
    onDropRejected: (rejections: FileRejection[]) =>
      toast.error(
        rejections[0]?.errors[0]?.code === "file-too-large"
          ? "That file is over 5 MB."
          : "Please upload a JPG, PNG, WebP or PDF."
      ),
  });

  if (file) {
    return (
      <div className="flex items-center gap-4 rounded-xl border bg-card p-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img src={preview} alt="" className="size-14 rounded-lg object-cover" />
        ) : (
          <span className="grid size-14 place-items-center rounded-lg bg-muted">
            <FileTextIcon className="size-6 text-muted-foreground" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange([])}
          aria-label="Remove file"
        >
          <XIcon />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      aria-invalid={invalid}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        isDragActive && "border-primary bg-primary/5",
        invalid && "border-destructive"
      )}
    >
      <input {...getInputProps({ id })} />
      <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
        <UploadCloudIcon className="size-5" />
      </span>
      <div className="space-y-1 text-sm">
        <p>
          <span className="font-medium text-brand">Click to upload</span> or drag and drop
        </p>
        <p className="text-muted-foreground">JPG, PNG, WebP or PDF · up to 5 MB</p>
      </div>
    </div>
  );
}
