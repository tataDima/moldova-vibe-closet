import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxImages?: number;
}

export const ImageUpload = ({ onImagesUploaded, maxImages = 5 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (uploadedImages.length + files.length > maxImages) {
      toast.error(`Poți încărca maxim ${maxImages} imagini`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      const newImages = [...uploadedImages, ...urls];
      
      setUploadedImages(newImages);
      setPreviews(newImages);
      onImagesUploaded(newImages);
      
      toast.success('Imagini încărcate cu succes!');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Eroare la încărcarea imaginilor');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setUploadedImages(newImages);
    setPreviews(newPreviews);
    onImagesUploaded(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="images">Imagini produse (max {maxImages})</Label>
        <div className="mt-2">
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading || uploadedImages.length >= maxImages}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('images')?.click()}
            disabled={uploading || uploadedImages.length >= maxImages}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Se încarcă...' : 'Alege imagini'}
          </Button>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
