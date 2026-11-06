import { BranchProfileView } from "./components/branch-profile-view";

type Props = { params: Promise<{ id: string }> };

const BranchProfilePage = async ({ params }: Props) => {
  const { id } = await params;
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      {/* Keyed so moving between branches starts with fresh UI state. */}
      <BranchProfileView key={id} branchId={id} />
    </div>
  );
};

export default BranchProfilePage;
