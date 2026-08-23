import React, { useState } from "react";
import { Edit2, Loader, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  createCategoryApi,
  deleteCategoryApi,
  updateCategoryApi,
} from "../../../services/adminService";

const CategoryManager = ({ categories, isLoading, onChanged }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const addCategory = async () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      toast.warning("Category name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await createCategoryApi(normalizedName);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setName("");
      toast.success("Category added.");
      await onChanged();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Category could not be added.");
    } finally {
      setIsSaving(false);
    }
  };

  const editCategory = async (category) => {
    const result = await Swal.fire({
      title: "Edit category",
      input: "text",
      inputValue: category.name,
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      inputValidator: (value) => (!value?.trim() ? "Category name is required." : undefined),
    });
    const normalizedName = result.value?.trim();
    if (!result.isConfirmed || !normalizedName || normalizedName === category.name) return;

    try {
      const response = await updateCategoryApi(category.id, normalizedName);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success("Category updated.");
      await onChanged();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Category could not be updated.");
    }
  };

  const deleteCategory = async (category) => {
    const result = await Swal.fire({
      title: "Delete category?",
      text: "Categories that still contain products cannot be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      confirmButtonText: "Delete category",
    });
    if (!result.isConfirmed) return;

    try {
      const response = await deleteCategoryApi(category.id);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success("Category deleted.");
      await onChanged();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Category could not be deleted.");
    }
  };

  return (
    <section className="card-box" aria-labelledby="category-heading">
      <h2 id="category-heading">Categories</h2>
      <div className="add-cat-input">
        <label className="sr-only" htmlFor="new-category">New category name</label>
        <input
          id="new-category"
          type="text"
          maxLength={100}
          placeholder="New category..."
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addCategory()}
        />
        <button type="button" onClick={addCategory} disabled={isSaving} aria-label="Add category">
          {isSaving ? <Loader size={18} className="spin" /> : <Plus size={18} />}
        </button>
      </div>

      {isLoading ? (
        <p className="admin-menu-state">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="admin-menu-state">No categories yet.</p>
      ) : (
        <ul className="cat-list">
          {categories.map((category) => (
            <li key={category.id}>
              <span>{category.name}</span>
              <div className="actions">
                <button type="button" className="btn-icon" onClick={() => editCategory(category)} aria-label={`Edit ${category.name}`}><Edit2 size={16} /></button>
                <button type="button" className="btn-icon delete" onClick={() => deleteCategory(category)} aria-label={`Delete ${category.name}`}><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CategoryManager;
