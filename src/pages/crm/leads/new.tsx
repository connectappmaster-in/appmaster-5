import { BackButton } from "@/components/BackButton";

const NewLead = () => {
  return (
    <>
      <BackButton />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">New Lead</h1>
        <p className="text-muted-foreground">Create new lead coming soon...</p>
      </div>
    </>
  );
};

export default NewLead;
