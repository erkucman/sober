
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ProductImageUploaderProps {
  previews: string[];
  onDrop: (files: File[]) => void;
  onRemove: (index: number) => void;
  label?: string;
}

export function ProductImageUploader({
  previews,
  onDrop,
  onRemove,
  label = 'Upload product images',
}: ProductImageUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.webp'] },
    multiple: true,
  });

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
        <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-muted-foreground">
            {isDragActive ? 'Drop files here...' : "Drag 'n' drop images here, or click to select"}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB each. Max 5 images.</p>
        </div>
      </div>
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div key={preview} className="relative group aspect-square">
              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onRemove(index); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
