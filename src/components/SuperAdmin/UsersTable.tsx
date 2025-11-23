import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSearchParams } from "react-router-dom";
import { UserDetailsModal } from "./UserDetailsModal";

export const UsersTable = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const orgFilter = searchParams.get("org");
  const [filterOrgName, setFilterOrgName] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [orgFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Query users table excluding appmaster_admins
      let query = supabase
        .from("users")
        .select(`
          *,
          organisations!users_organisation_id_fkey (
            name,
            account_type
          )
        `)
        .neq("user_type", "appmaster_admin");

      // Apply organization filter if present
      if (orgFilter) {
        query = query.eq("organisation_id", orgFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Fetched users:", data);
      
      // Get org name for filter display
      if (orgFilter && data && data.length > 0) {
        setFilterOrgName(data[0].organisations?.name || "Unknown Organisation");
      }
      
      // Transform to match expected format
      const transformedUsers = (data || []).map(user => ({
        ...user,
        organisation_name: user.organisations?.name || "No Organisation",
        account_type: user.organisations?.account_type || "organization",
        global_status: user.status,
        multi_org: false
      }));
      
      setUsers(transformedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const clearOrgFilter = () => {
    setSearchParams({});
    setFilterOrgName("");
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  return (
    <>
      <UserDetailsModal 
        userId={selectedUserId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onRefresh={fetchUsers}
      />
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Organization Filter Badge */}
      {orgFilter && filterOrgName && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-2">
            <span>Filtered by: {filterOrgName}</span>
            <button
              onClick={clearOrgFilter}
              className="hover:bg-muted rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No users found matching your search" : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <button 
                      onClick={() => handleUserClick(user.id)}
                      className="text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      {user.name || "-"}
                    </button>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.user_type === "individual" ? "secondary" : "outline"}
                      className="capitalize"
                    >
                      {user.user_type || "organization"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.organisation_name}</span>
                    <Badge 
                      variant="outline" 
                      className="ml-2 text-xs"
                    >
                      {user.account_type || "org"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role || "user"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUserClick(user.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Role</DropdownMenuItem>
                        <DropdownMenuItem>Impersonate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    </>
  );
};
