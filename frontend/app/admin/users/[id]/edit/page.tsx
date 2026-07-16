import EditUserForm from "./_components/EditUserForm";

export default async function EditUserPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    
    return (
        <div className="space-y-4">
            <EditUserForm userId={id} />
        </div>
    );
}