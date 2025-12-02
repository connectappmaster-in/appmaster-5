import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2, MapPin, FolderTree, Briefcase, Hash, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAssetSetupConfig } from "@/hooks/useAssetSetupConfig";
import { AddSiteDialog } from "@/components/ITAM/AddSiteDialog";
import { AddLocationDialog } from "@/components/ITAM/AddLocationDialog";
import { AddCategoryDialog } from "@/components/ITAM/AddCategoryDialog";
import { AddDepartmentDialog } from "@/components/ITAM/AddDepartmentDialog";
import { AddMakeDialog } from "@/components/ITAM/AddMakeDialog";
import { EditSiteDialog } from "@/components/ITAM/EditSiteDialog";
import { EditLocationDialog } from "@/components/ITAM/EditLocationDialog";
import { EditCategoryDialog } from "@/components/ITAM/EditCategoryDialog";
import { EditDepartmentDialog } from "@/components/ITAM/EditDepartmentDialog";
import { EditMakeDialog } from "@/components/ITAM/EditMakeDialog";
import { DeleteConfirmDialog } from "@/components/ITAM/DeleteConfirmDialog";
import { CategoryTagFormatDialog } from "@/components/ITAM/CategoryTagFormatDialog";
export default function FieldsSetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("tag-format");
  const {
    sites,
    locations,
    categories,
    departments,
    makes,
    tagFormat: existingTagFormat
  } = useAssetSetupConfig();
  const [tagPrefix, setTagPrefix] = useState("");
  const [tagStartNumber, setTagStartNumber] = useState("");

  // Dialog states
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [makeDialogOpen, setMakeDialogOpen] = useState(false);

  // Edit dialog states
  const [editSiteDialogOpen, setEditSiteDialogOpen] = useState(false);
  const [editLocationDialogOpen, setEditLocationDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editDepartmentDialogOpen, setEditDepartmentDialogOpen] = useState(false);
  const [editMakeDialogOpen, setEditMakeDialogOpen] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Selected items
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any | null>(null);
  const [selectedMake, setSelectedMake] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);

  // Tag format dialog for categories
  const [tagFormatDialogOpen, setTagFormatDialogOpen] = useState(false);
  const [selectedCategoryForTag, setSelectedCategoryForTag] = useState<any | null>(null);
  const [categoryFormats, setCategoryFormats] = useState<any>({});

  // Automatically calculate padding length from starting number
  const tagPaddingLength = tagStartNumber.length || 4;

  // Load existing tag format when it's available
  useEffect(() => {
    if (existingTagFormat) {
      setTagPrefix(existingTagFormat.prefix || "AS-");
      setTagStartNumber(existingTagFormat.start_number || "0001");
    }
  }, [existingTagFormat]);

  // Load category tag formats
  useEffect(() => {
    const loadCategoryFormats = async () => {
      const {
        data
      } = await supabase.from('category_tag_formats').select('*');
      if (data) {
        const formats: any = {};
        data.forEach(format => {
          formats[`format_${format.category_id}`] = format;
        });
        setCategoryFormats(formats);
      }
    };
    loadCategoryFormats();
  }, []);
  const saveTagFormat = useMutation({
    mutationFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const {
        data: userData
      } = await supabase.from("users").select("organisation_id").eq("auth_user_id", user.id).single();
      if (!userData?.organisation_id) throw new Error("Organization not found");

      // Check if tag format already exists
      const {
        data: existing
      } = await supabase.from("itam_tag_format").select("id").eq("organisation_id", userData.organisation_id).maybeSingle();

      // Calculate padding length from starting number length
      const calculatedPaddingLength = tagStartNumber.length || 4;
      if (existing) {
        // Update existing
        const {
          error
        } = await supabase.from("itam_tag_format").update({
          prefix: tagPrefix,
          start_number: tagStartNumber,
          padding_length: calculatedPaddingLength
        }).eq("id", existing.id);
        if (error) throw error;
      } else {
        // Insert new
        const {
          error
        } = await supabase.from("itam_tag_format").insert({
          organisation_id: userData.organisation_id,
          prefix: tagPrefix,
          start_number: tagStartNumber,
          padding_length: calculatedPaddingLength,
          auto_increment: true
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Tag format saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["itam-tag-format"]
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to save tag format: " + error.message);
    }
  });
  return <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">Fields Setup</h1>
            
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="makes">Makes</TabsTrigger>
            <TabsTrigger value="tag-format">Tag Format</TabsTrigger>
          </TabsList>

          {/* Sites */}
          <TabsContent value="sites" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Sites
                  </CardTitle>
                  <CardDescription className="text-xs">Manage site locations</CardDescription>
                </div>
                <Button size="sm" onClick={() => setSiteDialogOpen(true)}>
                  <Plus className="h-3 w-3 mr-2" />
                  Add Site
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map(site => <TableRow key={site.id}>
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setSelectedSite(site);
                        setEditSiteDialogOpen(true);
                      }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                        setDeleteItem({
                          ...site,
                          type: 'site'
                        });
                        setDeleteDialogOpen(true);
                      }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations */}
          <TabsContent value="locations" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Locations
                  </CardTitle>
                  <CardDescription className="text-xs">Manage locations within sites</CardDescription>
                </div>
                <Button size="sm" onClick={() => setLocationDialogOpen(true)}>
                  <Plus className="h-3 w-3 mr-2" />
                  Add Location
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead>SITE</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map(location => <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{(location as any).itam_sites?.name || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setSelectedLocation(location);
                        setEditLocationDialogOpen(true);
                      }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                        setDeleteItem({
                          ...location,
                          type: 'location'
                        });
                        setDeleteDialogOpen(true);
                      }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories */}
          <TabsContent value="categories" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderTree className="h-4 w-4" />
                    Categories
                  </CardTitle>
                  <CardDescription className="text-xs">Manage asset categories</CardDescription>
                </div>
                <Button size="sm" onClick={() => setCategoryDialogOpen(true)}>
                  <Plus className="h-3 w-3 mr-2" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map(category => <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setSelectedCategory(category);
                        setEditCategoryDialogOpen(true);
                      }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                        setDeleteItem({
                          ...category,
                          type: 'category'
                        });
                        setDeleteDialogOpen(true);
                      }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments */}
          <TabsContent value="departments" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Departments
                  </CardTitle>
                  <CardDescription className="text-xs">Manage departments</CardDescription>
                </div>
                <Button size="sm" onClick={() => setDepartmentDialogOpen(true)}>
                  <Plus className="h-3 w-3 mr-2" />
                  Add Department
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map(dept => <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setSelectedDepartment(dept);
                        setEditDepartmentDialogOpen(true);
                      }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                        setDeleteItem({
                          ...dept,
                          type: 'department'
                        });
                        setDeleteDialogOpen(true);
                      }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Makes */}
          <TabsContent value="makes" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Makes
                  </CardTitle>
                  <CardDescription className="text-xs">Manage asset manufacturers/brands</CardDescription>
                </div>
                <Button size="sm" onClick={() => setMakeDialogOpen(true)}>
                  <Plus className="h-3 w-3 mr-2" />
                  Add Make
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {makes.map(make => <TableRow key={make.id}>
                        <TableCell className="font-medium">{make.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setSelectedMake(make);
                        setEditMakeDialogOpen(true);
                      }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                        setDeleteItem({
                          ...make,
                          type: 'make'
                        });
                        setDeleteDialogOpen(true);
                      }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tag Format */}
          <TabsContent value="tag-format" className="mt-4">
            <Card>
              <CardHeader>
                
                <CardDescription className="text-xs">
                  Configure unique tag format for each category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CATEGORY</TableHead>
                      <TableHead>PREFIX</TableHead>
                      <TableHead>NEXT NUMBER</TableHead>
                      <TableHead>SAMPLE TAG</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map(category => {
                    const formatKey = `format_${category.id}`;
                    const format = categoryFormats[formatKey];
                    const prefix = format?.prefix || '-';
                    const nextNum = format?.current_number || 1;
                    const padding = format?.zero_padding || 2;
                    const sampleTag = format ? `${prefix}${nextNum.toString().padStart(padding, '0')}` : 'Not Configured';
                    return <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{prefix}</TableCell>
                          <TableCell>{format ? nextNum.toString().padStart(padding, '0') : '-'}</TableCell>
                          <TableCell className="font-mono text-sm">{sampleTag}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                          setSelectedCategoryForTag(category);
                          setTagFormatDialogOpen(true);
                        }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>;
                  })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* All Dialogs */}
      <AddSiteDialog open={siteDialogOpen} onOpenChange={setSiteDialogOpen} />
      <AddLocationDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />
      <AddCategoryDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />
      <AddDepartmentDialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen} />
      <AddMakeDialog open={makeDialogOpen} onOpenChange={setMakeDialogOpen} />
      
      <EditSiteDialog open={editSiteDialogOpen && !!selectedSite} onOpenChange={open => {
      setEditSiteDialogOpen(open);
      if (!open) setSelectedSite(null);
    }} site={selectedSite} />
      <EditLocationDialog open={editLocationDialogOpen && !!selectedLocation} onOpenChange={open => {
      setEditLocationDialogOpen(open);
      if (!open) setSelectedLocation(null);
    }} location={selectedLocation} />
      <EditCategoryDialog open={editCategoryDialogOpen && !!selectedCategory} onOpenChange={open => {
      setEditCategoryDialogOpen(open);
      if (!open) setSelectedCategory(null);
    }} category={selectedCategory} />
      <EditDepartmentDialog open={editDepartmentDialogOpen && !!selectedDepartment} onOpenChange={open => {
      setEditDepartmentDialogOpen(open);
      if (!open) setSelectedDepartment(null);
    }} department={selectedDepartment} />
      <EditMakeDialog open={editMakeDialogOpen && !!selectedMake} onOpenChange={open => {
      setEditMakeDialogOpen(open);
      if (!open) setSelectedMake(null);
    }} make={selectedMake} />
      
      <DeleteConfirmDialog open={deleteDialogOpen && !!deleteItem} onOpenChange={open => {
      setDeleteDialogOpen(open);
      if (!open) setDeleteItem(null);
    }} item={deleteItem} />

      <CategoryTagFormatDialog open={tagFormatDialogOpen && !!selectedCategoryForTag} onOpenChange={open => {
      setTagFormatDialogOpen(open);
      if (!open) setSelectedCategoryForTag(null);
    }} category={selectedCategoryForTag} existingFormat={selectedCategoryForTag ? categoryFormats[`format_${selectedCategoryForTag.id}`] : null} />
    </div>;
}