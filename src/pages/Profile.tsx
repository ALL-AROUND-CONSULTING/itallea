import { PageHeader } from "@/components/layout/PageHeader";

const Profile = () => (
  <>
    <PageHeader title="Profilo" showThemeToggle />
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <p className="text-muted-foreground">Il profilo sarà qui.</p>
    </div>
  </>
);

export default Profile;
