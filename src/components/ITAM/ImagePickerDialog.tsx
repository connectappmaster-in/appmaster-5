import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Image as ImageIcon, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImagePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (url: string) => void;
  currentImage?: string;
}

export const ImagePickerDialog = ({
  open,
  onOpenChange,
  onImageSelect,
  currentImage
}: ImagePickerDialogProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>(currentImage || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open]);

  useEffect(() => {
    setSelectedImage(currentImage || "");
  }, [currentImage]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("asset-photos")
        .list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" }
        });

      if (error) throw error;

      const imageUrls = data
        .filter(file => file.name !== ".emptyFolderPlaceholder")
        .map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from("asset-photos")
            .getPublicUrl(file.name);
          return publicUrl;
        });

      setImages(imageUrls);
    } catch (error: any) {
      toast.error("Failed to load images: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("asset-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("asset-photos")
        .getPublicUrl(fileName);

      // Refresh image list and auto-select the new image
      await loadImages();
      setSelectedImage(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload image: " + error.message);
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const handleUseImage = () => {
    if (selectedImage) {
      onImageSelect(selectedImage);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select or Upload Asset Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Section */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading || loading}
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Image
                </>
              )}
            </Button>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>

          {/* Image Grid */}
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ImageIcon className="h-16 w-16 mb-4" />
                <p>No images uploaded yet</p>
                <p className="text-sm">Upload your first asset image</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-lg border-2 cursor-pointer overflow-hidden transition-all hover:border-primary ${
                      selectedImage === url ? "border-primary ring-2 ring-primary" : "border-border"
                    }`}
                    onClick={() => setSelectedImage(url)}
                  >
                    <img
                      src={url}
                      alt={`Asset ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === url && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Preview and Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedImage ? (
                <span>Image selected</span>
              ) : (
                <span>Select an image or upload a new one</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUseImage}
                disabled={!selectedImage}
              >
                Use Image
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
