import React, { useEffect, useState, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader,
} from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  getAllCategoriesAdminApi,
  createCategoryApi,
  deleteCategoryApi,
  updateCategoryApi,
  getAllProductsAdminApi,
  createProductApi,
  deleteProductApi,
  updateProductApi,
} from "../../services/adminService";
import "./ManageMenu.scss";

const ManageMenu = () => {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [isLoadingCat, setIsLoadingCat] = useState(false);

  const [products, setProducts] = useState([]);
  const [isLoadingProd, setIsLoadingProd] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    original_price: "",
    stock_quantity: "",
    category_id: "",
    description: "",
    is_available: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [editProductId, setEditProductId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoadingCat(true);
    setIsLoadingProd(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        getAllCategoriesAdminApi(),
        getAllProductsAdminApi("all", 1, 100),
      ]);

      if (catRes?.EC === 0) setCategories(catRes.DT);
      if (prodRes?.EC === 0) setProducts(prodRes.DT.products);
    } catch (error) {
      toast.error("Failed to load menu data");
    }
    setIsLoadingCat(false);
    setIsLoadingProd(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      let res = await createCategoryApi(newCatName);
      if (res && res.EC === 0) {
        toast.success("Category added!");
        setNewCatName("");
        fetchData();
      } else toast.error(res.EM);
    } catch (e) {
      toast.error("Error adding category");
    }
  };

  const handleDeleteCategory = async (id) => {
    const isConfirm = await Swal.fire({
      title: "Delete Category?",
      text: "This might affect products linked to it.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0F172A",
      confirmButtonText: "Yes, delete it!",
    });
    if (isConfirm.isConfirmed) {
      let res = await deleteCategoryApi(id);
      if (res && res.EC === 0) {
        toast.success("Deleted successfully");
        fetchData();
      } else toast.error(res.EM);
    }
  };

  const handleEditCategory = async (cat) => {
    const { value: newName } = await Swal.fire({
      title: "Edit Category",
      input: "text",
      inputValue: cat.name,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "Name cannot be empty!";
      },
    });

    if (newName && newName !== cat.name) {
      let res = await updateCategoryApi(cat.id, newName);
      if (res && res.EC === 0) {
        toast.success("Category updated!");
        fetchData();
      } else toast.error(res.EM);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => {
      const newState = { ...prev, [name]: type === "checkbox" ? checked : value };
      
      // Auto logic: Tự động tắt is_available nếu stock_quantity <= 0
      if (name === "stock_quantity") {
        const stockVal = parseInt(value || 0);
        if (stockVal <= 0) newState.is_available = false;
      }
      return newState;
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category_id) {
      toast.warning("Name, Price, and Category are required!");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", productForm.name);
    formData.append("price", productForm.price);
    formData.append("original_price", productForm.original_price || productForm.price);
    
    // Check lại lần cuối trước khi submit
    const finalStock = parseInt(productForm.stock_quantity || 0);
    const finalIsAvailable = finalStock > 0 ? productForm.is_available : false;

    formData.append("stock_quantity", finalStock);
    formData.append("category_id", productForm.category_id);
    formData.append("description", productForm.description);
    formData.append("is_available", finalIsAvailable);
    if (imageFile) formData.append("image", imageFile);

    try {
      let res;
      if (editProductId) {
        res = await updateProductApi(editProductId, formData);
      } else {
        res = await createProductApi(formData);
      }

      if (res && res.EC === 0) {
        toast.success(editProductId ? "Product updated!" : "Product saved!");
        resetProductForm();
        fetchData();
      } else toast.error(res.EM);
    } catch (e) {
      toast.error("Error saving product");
    }
    setIsSubmitting(false);
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      price: "",
      original_price: "",
      stock_quantity: "",
      category_id: "",
      description: "",
      is_available: true,
    });
    setImageFile(null);
    setImagePreview("");
    setEditProductId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteProduct = async (id) => {
    const isConfirm = await Swal.fire({
      title: "Delete Dish?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0F172A",
      confirmButtonText: "Yes, delete it!",
    });
    if (isConfirm.isConfirmed) {
      let res = await deleteProductApi(id);
      if (res && res.EC === 0) fetchData();
    }
  };

  const handleEditProduct = (prod) => {
    setEditProductId(prod.id);
    setProductForm({
      name: prod.name,
      price: prod.price,
      original_price: prod.original_price,
      stock_quantity: prod.stock_quantity, // Fill stock cũ vào ô input
      category_id: prod.category_id,
      description: prod.description || "",
      is_available: prod.is_available,
    });
    setImagePreview(prod.image_url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="manage-menu-container">
      <h1 className="page-title">Menu Management</h1>

      <div className="menu-layout">
        <div className="categories-column">
          <div className="card-box">
            <h3>Categories</h3>
            <div className="add-cat-input">
              <input
                type="text"
                placeholder="New category..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <button onClick={handleAddCategory}>
                <Plus size={18} />
              </button>
            </div>
            <ul className="cat-list">
              {isLoadingCat ? (
                <p>Loading...</p>
              ) : (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <span>{cat.name}</span>
                    <div className="actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEditCategory(cat)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="products-column">
          <div className="section-header">
            <h3>Dishes</h3>
          </div>

          <div className="product-form-box">
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Dish Name (e.g. Pan-Seared Scallops)"
                value={productForm.name}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="price"
                placeholder="Price ($)"
                value={productForm.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                name="stock_quantity"
                placeholder="Stock Qty (e.g. 50)"
                value={productForm.stock_quantity}
                onChange={handleInputChange}
              />
              <select
                name="category_id"
                value={productForm.category_id}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={productForm.is_available}
                  onChange={handleInputChange}
                  disabled={parseInt(productForm.stock_quantity || 0) <= 0}
                />
                In Stock
              </label>
            </div>

            <div className="image-upload-row">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-btn">
                <ImageIcon size={18} /> Choose Image from Local
              </label>
              {imagePreview && (
                <div className="preview-box">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <textarea
              name="description"
              placeholder="Description..."
              value={productForm.description}
              onChange={handleInputChange}
            ></textarea>

            <div className="form-actions">
              <button className="btn-cancel" onClick={resetProductForm}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveProduct}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader size={16} className="spin" />
                ) : editProductId ? (
                  "Update Dish"
                ) : (
                  "Save Dish"
                )}
              </button>
            </div>
          </div>

          <div className="products-grid">
            {isLoadingProd ? (
              <p>Loading dishes...</p>
            ) : (
              products.map((prod) => (
                <div className="dish-card" key={prod.id}>
                  <img
                    src={prod.image_url || "https://via.placeholder.com/150"}
                    alt={prod.name}
                    className="dish-img"
                  />
                  <div className="dish-info">
                    <div className="top-row">
                      <h4>{prod.name}</h4>
                      <div className="card-actions">
                        <button onClick={() => handleEditProduct(prod)}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Hiển thị Stock ở đây */}
                    <p className="category-text">
                      {prod.Category?.name || "Uncategorized"} • Stock: <strong style={{color: prod.stock_quantity <= 5 ? '#DC2626' : 'inherit'}}>{prod.stock_quantity}</strong>
                    </p>
                    <div className="bottom-row">
                      <span className="price">${prod.price}</span>
                      {prod.is_available ? (
                        <span className="badge in-stock">In Stock</span>
                      ) : (
                        <span className="badge out-stock">Out</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMenu;