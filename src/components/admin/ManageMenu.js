import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import {
  getAllCategoriesAdminApi,
  getAllProductsAdminApi,
} from "../../services/adminService";
import CategoryManager from "./menu/CategoryManager";
import ProductForm from "./menu/ProductForm";
import ProductList from "./menu/ProductList";
import "./ManageMenu.scss";

const ManageMenu = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [categoryResponse, productResponse] = await Promise.all([
        getAllCategoriesAdminApi(),
        getAllProductsAdminApi("all", 1, 100),
      ]);
      if (categoryResponse?.EC !== 0) throw new Error(categoryResponse?.EM);
      if (productResponse?.EC !== 0) throw new Error(productResponse?.EM);
      setCategories(categoryResponse.DT || []);
      setProducts(productResponse.DT?.products || []);
    } catch (error) {
      const message = error?.EM || error?.message || "Menu data could not be loaded.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const beginEdit = (product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="manage-menu-container">
      <div className="page-heading">
        <div>
          <h1>Menu Management</h1>
          <p>Manage categories, availability, stock, and realistic preparation times.</p>
        </div>
        <button type="button" className="refresh-button" onClick={fetchData} disabled={isLoading}><RefreshCw size={17} />Refresh</button>
      </div>

      {errorMessage && (
        <div className="admin-menu-error" role="alert">
          <span>{errorMessage}</span>
          <button type="button" onClick={fetchData}>Try again</button>
        </div>
      )}

      <div className="menu-layout">
        <aside className="categories-column">
          <CategoryManager categories={categories} isLoading={isLoading} onChanged={fetchData} />
        </aside>

        <main className="products-column">
          <ProductForm
            categories={categories}
            editingProduct={editingProduct}
            onSaved={fetchData}
            onCancelEdit={() => setEditingProduct(null)}
          />
          <ProductList products={products} isLoading={isLoading} onEdit={beginEdit} onChanged={fetchData} />
        </main>
      </div>
    </div>
  );
};

export default ManageMenu;
