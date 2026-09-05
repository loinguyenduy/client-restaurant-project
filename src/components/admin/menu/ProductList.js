import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { deleteProductApi } from "../../../services/adminService";
import ProductImage from "../../menu/ProductImage";
import formatCurrency from "../../../utils/formatCurrency";

const ProductList = ({ products, isLoading, onEdit, onChanged }) => {
  const deleteProduct = async (product) => {
    const result = await Swal.fire({
      title: "Delete dish?",
      text: "A dish used by carts or orders cannot be deleted. Mark it unavailable instead.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      confirmButtonText: "Delete dish",
    });
    if (!result.isConfirmed) return;

    try {
      const response = await deleteProductApi(product.id);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success("Dish deleted.");
      await onChanged();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Dish could not be deleted.");
    }
  };

  if (isLoading) return <div className="admin-menu-state product-list-state">Loading dishes...</div>;
  if (products.length === 0) return <div className="admin-menu-state product-list-state">No dishes have been added yet.</div>;

  return (
    <section aria-labelledby="dish-list-heading">
      <div className="section-header"><h2 id="dish-list-heading">Dishes</h2><span>{products.length} shown</span></div>
      <div className="products-grid">
        {products.map((product) => {
          const soldOut = !product.is_available || product.stock_quantity <= 0;
          return (
            <article className="dish-card" key={product.id}>
              <div className="dish-img"><ProductImage src={product.image_url} alt={product.name} /></div>
              <div className="dish-info">
                <div className="top-row">
                  <div className="dish-title"><h3>{product.name}</h3>{product.is_featured && <span className="featured-badge">Featured</span>}</div>
                  <div className="card-actions">
                    <button type="button" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`}><Edit2 size={15} /></button>
                    <button type="button" onClick={() => deleteProduct(product)} aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button>
                  </div>
                </div>
                <p className="category-text">{product.Category?.name || "Uncategorized"} · {product.prep_time_minutes ?? 15} min</p>
                <p className={`stock-text ${product.stock_quantity <= 5 ? "low" : ""}`}>Stock: {product.stock_quantity}</p>
                <div className="bottom-row">
                  <span className="price">{formatCurrency(product.price)}</span>
                  <span className={`badge ${soldOut ? "out-stock" : "in-stock"}`}>{soldOut ? "Unavailable" : "Available"}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ProductList;
