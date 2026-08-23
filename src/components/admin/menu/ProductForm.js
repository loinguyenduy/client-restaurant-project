import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { createProductApi, updateProductApi } from "../../../services/adminService";
import ProductImage from "../../menu/ProductImage";

const emptyForm = {
  name: "",
  price: "",
  original_price: "",
  stock_quantity: "",
  prep_time_minutes: "",
  category_id: "",
  description: "",
  is_available: true,
};

const ProductForm = ({ categories, editingProduct, onSaved, onCancelEdit }) => {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!editingProduct) {
      setForm(emptyForm);
      setImagePreview("");
      setImageFile(null);
      return;
    }

    setForm({
      name: editingProduct.name || "",
      price: editingProduct.price ?? "",
      original_price: editingProduct.original_price ?? "",
      stock_quantity: editingProduct.stock_quantity ?? "",
      prep_time_minutes: editingProduct.prep_time_minutes ?? 15,
      category_id: editingProduct.category_id ?? "",
      description: editingProduct.description || "",
      is_available: Boolean(editingProduct.is_available),
    });
    setImagePreview(editingProduct.image_url || "");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [editingProduct]);

  useEffect(() => {
    if (!imageFile) return undefined;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const changeField = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: type === "checkbox" ? checked : value };
      if (name === "stock_quantity" && Number(value) <= 0) next.is_available = false;
      return next;
    });
  };

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.warning("Choose a JPG or PNG image.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }
    setImageFile(file);
  };

  const reset = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onCancelEdit();
  };

  const validate = () => {
    if (!form.name.trim()) return "Dish name is required.";
    if (!form.category_id) return "Category is required.";
    if (!Number.isSafeInteger(Number(form.price)) || Number(form.price) <= 0) return "Price must be a positive VND integer.";
    if (!Number.isInteger(Number(form.stock_quantity)) || Number(form.stock_quantity) < 0) return "Stock must be a non-negative integer.";
    const prepTime = Number(form.prep_time_minutes);
    if (!Number.isInteger(prepTime) || prepTime < 1 || prepTime > 180) return "Preparation time must be between 1 and 180 minutes.";
    if (form.original_price !== "" && (!Number.isSafeInteger(Number(form.original_price)) || Number(form.original_price) < 0)) return "Original price must be a non-negative VND integer.";
    return "";
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("price", form.price);
    if (form.original_price !== "") payload.append("original_price", form.original_price);
    payload.append("stock_quantity", form.stock_quantity);
    payload.append("prep_time_minutes", form.prep_time_minutes);
    payload.append("category_id", form.category_id);
    payload.append("description", form.description.trim());
    payload.append("is_available", Number(form.stock_quantity) > 0 ? form.is_available : false);
    if (imageFile) payload.append("image", imageFile);

    setIsSubmitting(true);
    try {
      const response = editingProduct
        ? await updateProductApi(editingProduct.id, payload)
        : await createProductApi(payload);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success(editingProduct ? "Dish updated." : "Dish created.");
      reset();
      await onSaved();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Dish could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="product-form-box" onSubmit={saveProduct}>
      <div className="form-heading">
        <h2>{editingProduct ? "Edit dish" : "Add a dish"}</h2>
        <p>Preparation time is required for new dishes.</p>
      </div>

      <div className="form-grid">
        <label>Dish name<input type="text" name="name" maxLength={150} value={form.name} onChange={changeField} required /></label>
        <label>Price (VND)<input type="number" name="price" min="1" step="1" value={form.price} onChange={changeField} required /></label>
        <label>Original price (VND, optional)<input type="number" name="original_price" min="0" step="1" value={form.original_price} onChange={changeField} /></label>
        <label>Stock quantity<input type="number" name="stock_quantity" min="0" step="1" value={form.stock_quantity} onChange={changeField} required /></label>
        <label>Preparation time (minutes)<input type="number" name="prep_time_minutes" min="1" max="180" step="1" value={form.prep_time_minutes} onChange={changeField} required /></label>
        <label>Category<select name="category_id" value={form.category_id} onChange={changeField} required><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      </div>

      <label className="description-field">Description<textarea name="description" maxLength={1000} value={form.description} onChange={changeField} /></label>

      <div className="image-upload-row">
        <input id="product-image" type="file" accept="image/jpeg,image/png" ref={fileInputRef} onChange={selectImage} />
        <label htmlFor="product-image" className="upload-btn"><ImageIcon size={18} />Choose JPG or PNG</label>
        {imagePreview && <div className="preview-box"><ProductImage src={imagePreview} alt="Dish preview" /></div>}
        <small>Maximum file size: 5 MB.</small>
      </div>

      <label className="checkbox-label">
        <input type="checkbox" name="is_available" checked={form.is_available} onChange={changeField} disabled={Number(form.stock_quantity) <= 0} />
        Available for ordering
      </label>

      <div className="form-actions">
        {editingProduct && <button type="button" className="btn-cancel" onClick={reset}>Cancel edit</button>}
        <button type="submit" className="btn-save" disabled={isSubmitting || categories.length === 0}>
          {isSubmitting ? <><Loader size={16} className="spin" />Saving...</> : editingProduct ? "Update dish" : "Save dish"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
