import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  currentImageUrl?: string | null;
  onFileRemove?: () => void;
  label?: string;
}

export function FileUploader({ onFileUpload, currentImageUrl, onFileRemove, label = 'Upload an image' }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      const newPreview = URL.createObjectURL(file);
      setPreview(newPreview);
      onFileUpload(file);
    }
  }, [onFileUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.webp'] },
    multiple: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) {
        URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onFileRemove?.();
  };

  return (
    <div>
        {label && <Label className="text-sm font-medium mb-2 block">{label}</Label>}
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
            }`}
        >
            <input {...getInputProps()} />
            {preview ? (
            <div className="relative group">
                <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-lg" />
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
                <UploadCloud className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-muted-foreground">
                {isDragActive ? 'Drop the file here...' : "Drag 'n' drop an image here, or click to select"}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
            </div>
            )}
        </div>
    </div>
  );
}
