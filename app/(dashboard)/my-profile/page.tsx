import { PageSectionHeader } from "@/components/common/page-section-header";
import { ProfileDetails } from "./components/profile-details";
import { ProfileChangePassword } from "./components/profile-change-password";
import { InstructorProfileCard } from "./components/instructor-profile-card";

const MyProfilePage = () => (
  <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
    <PageSectionHeader
      title="My profile"
      description="Your account details and password."
    />
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <ProfileDetails />
      <div className="grid gap-6">
        <InstructorProfileCard />
        <ProfileChangePassword />
      </div>
    </div>
  </div>
);

export default MyProfilePage;
