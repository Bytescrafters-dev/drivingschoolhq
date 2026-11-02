import { PageSectionHeader } from "@/components/common/page-section-header";
import { SettingsSections } from "./components/settings-sections";

const SettingsPage = () => (
  <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
    <PageSectionHeader
      title="Settings"
      description="Manage your driving school's branches and staff."
    />
    <SettingsSections />
  </div>
);

export default SettingsPage;
