import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface DocsTabProps {
  assetId: number;
}

export const DocsTab = ({ assetId }: DocsTabProps) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("invoice");

  const { data: documents, isLoading } = useQuery({
    queryKey: ["asset-documents", assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_documents")
        .select("*")
        .eq("asset_id", assetId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const deleteDocument = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from("asset_documents")
        .delete()
        .eq("id", docId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Document deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["asset-documents", assetId] });
    },
    onError: () => {
      toast.error("Failed to delete document");
    }
  });

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.tenant_id}/documents/${assetId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('asset-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('asset-photos')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("asset_documents")
        .insert({
          tenant_id: profile.tenant_id,
          asset_id: assetId,
          document_type: docType,
          document_name: file.name,
          document_url: publicUrl,
          uploaded_by: user.id
        });

      if (insertError) throw insertError;

      toast.success("Document uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["asset-documents", assetId] });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading documents...</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="doc-type" className="text-xs">Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="warranty">Warranty Card</SelectItem>
                  <SelectItem value="po">Purchase Order</SelectItem>
                  <SelectItem value="manual">User Manual</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label htmlFor="doc-upload">
              <Button variant="outline" size="sm" disabled={uploading} asChild>
                <span className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload
                </span>
              </Button>
            </label>
            <Input
              id="doc-upload"
              type="file"
              onChange={handleDocumentUpload}
              className="hidden"
            />
          </div>

          {(!documents || documents.length === 0) ? (
            <div className="text-center py-6 text-sm text-muted-foreground">No documents uploaded</div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.document_type} • {format(new Date(doc.uploaded_at), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => window.open(doc.document_url, '_blank')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteDocument.mutate(doc.id)}
                      disabled={deleteDocument.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
