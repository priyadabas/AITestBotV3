import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  uploadText: string;
  supportedFormats: string;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = {
    "text/plain": [".txt"],
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  uploadText,
  supportedFormats,
  className,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
        isDragActive && !isDragReject
          ? "border-primary bg-primary/5"
          : isDragReject
          ? "border-red-400 bg-red-50"
          : "border-slate-300 hover:border-primary",
        className
      )}
    >
      <input {...getInputProps()} />
      <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-4"></i>
      <p className="text-sm font-medium text-slate-700 mb-2">{uploadText}</p>
      <p className="text-xs text-slate-500 mb-4">{supportedFormats}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-sm"
      >
        Choose File
      </Button>
    </div>
  );
}
