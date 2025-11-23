import { OrganizationUsersTable } from "@/components/SuperAdmin/OrganizationUsersTable";

const SuperAdminOrganizationUsers = () => {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-bold">Organization Users</h2>
        <p className="text-sm text-muted-foreground">Manage users within organizations</p>
      </div>
      <OrganizationUsersTable />
    </div>
  );
};

export default SuperAdminOrganizationUsers;
