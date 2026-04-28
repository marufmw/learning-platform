"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  useGetChildrenQuery,
  useCreateChildMutation,
  useUpdateChildMutation,
} from "@/lib/api/hooks";

export default function ChildrenPage() {
  const { isLoaded, userId } = useAuth();
  const { data: children, refetch } = useGetChildrenQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { mutate: createChild, isLoading: isCreating } = useCreateChildMutation();
  const { mutate: updateChild, isLoading: isUpdating } = useUpdateChildMutation();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", age: "", gender: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name) {
      setError("Name is required");
      return;
    }

    if (!formData.age) {
      setError("Age is required");
      return;
    }

    if (!formData.gender) {
      setError("Gender is required");
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 1 || age > 18) {
      setError("Age must be between 1 and 18");
      return;
    }

    try {
      if (editingId) {
        await updateChild({
          id: editingId,
          name: formData.name,
          age,
          gender: formData.gender,
        });
        setEditingId(null);
      } else {
        await createChild({
          name: formData.name,
          age,
          gender: formData.gender,
        });
      }

      setFormData({ name: "", age: "", gender: "" });
      setShowForm(false);
      await refetch();
    } catch (err: any) {
      setError(err.message || "Failed to save child");
    }
  };

  const handleEdit = (child: any) => {
    setEditingId(child.id);
    setFormData({
      name: child.name,
      age: String(child.age || ""),
      gender: child.gender || "",
    });
    setShowForm(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Children</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>
      )}

      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", age: "", gender: "" });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
        >
          + Create Child
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded p-4 mb-6 bg-gray-50">
          <h2 className="font-bold mb-4">
            {editingId ? "Edit Child" : "Create Child"}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Child's name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Age (1-18)</label>
            <input
              type="number"
              min="1"
              max="18"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Age"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isCreating || isUpdating ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {children?.map((child) => (
          <div
            key={child.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{child.name}</h3>
              <p className="text-sm text-gray-600">
                Age: {child.age} • Gender: {child.gender === "male" ? "👨" : "👩"}
              </p>
            </div>
            <button
              onClick={() => handleEdit(child)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {!children?.length && !showForm && (
        <p className="text-gray-600">No children yet.</p>
      )}
    </div>
  );
}
