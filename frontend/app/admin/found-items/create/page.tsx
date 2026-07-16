import CreateFoundItemForm from '../_components/CreateFoundItemForm';

export default function CreateFoundItemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Post a Found Item</h1>
        <p className="text-gray-600 mt-1">Add a new found item that can be claimed by its owner</p>
      </div>
      <CreateFoundItemForm />
    </div>
  );
}
