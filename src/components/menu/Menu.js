import React, { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import ReactPaginate from "react-paginate";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { getAllCategories } from "../../services/categoryService";
import { getAllProducts } from "../../services/productService";
import { addToCartApi } from "../../services/cartService";
import { doAddToCart } from "../../redux/actions/cartAction";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import "./Menu.scss";

const Menu = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "";
  const currentPage = searchParams.get("page") || 1;

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [searchParams]);

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => { updateSearchParams("search", searchInput, true); }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchCategories = async () => {
    let res = await getAllCategories();
    if (res && res.EC === 0) setCategories(res.DT);
  };

  const fetchProducts = async () => {
    const options = {
      category_id: currentCategory, search: searchParams.get("search") || "", sort: currentSort, page: currentPage, limit: 9,
    };
    let res = await getAllProducts(options);
    if (res && res.EC === 0) {
      setProducts(res.DT.products || []);
      setTotalPages(res.DT.totalPages || 0);
    }
  };

  const updateSearchParams = (key, value, resetPage = false) => {
    setSearchParams((prev) => {
      if (!value || value === "all") prev.delete(key);
      else prev.set(key, value);
      if (resetPage) prev.delete("page");
      return prev;
    });
  };

  // Handle adding to cart 
  const handleAddToCart = async (product, qtyToAdd) => {
    if (isAuthenticated) {
      try {
        let res = await addToCartApi(product.id, qtyToAdd);
        if (res && res.EC === 0) {
          toast.success(`Added ${qtyToAdd} ${product.name} to your cart!`);
          dispatch(doAddToCart(product, qtyToAdd));
        } else {
          toast.error(res.EM || "Could not add to cart.");
        }
      } catch (error) {
        toast.error("Server error. Please try again.");
      }
    } else {
      const existingItem = cartItems.find((item) => item.product_id === product.id);
      const currentQtyInCart = existingItem ? existingItem.quantity : 0;

      if (currentQtyInCart + qtyToAdd > product.stock_quantity) {
        toast.warning(`You already have ${currentQtyInCart} in cart. We only have ${product.stock_quantity} left!`);
        return;
      }

      dispatch(doAddToCart(product, qtyToAdd));
      toast.success(`Added ${qtyToAdd} ${product.name} to your temporary cart!`);
    }
  };

  return (
    <div className="menu-page">
      {/* Modal mounts here. It only shows if selectedProduct is not null */}
      <ProductModal 
        product={selectedProduct} 
        categories={categories} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={handleAddToCart}
      />

      <section className="menu-banner">
        <div className="banner-content">
          <h1>OUR MENU</h1>
          <p>Discover the finest culinary creations</p>
        </div>
      </section>

      <div className="menu-container">
        <aside className="category-sidebar">
          <h3 className="sidebar-title">Categories</h3>
          <ul className="category-list">
            <li className={currentCategory === "all" ? "active" : ""} onClick={() => updateSearchParams("category", "all", true)}>All Items</li>
            {categories.map((item) => (
              <li key={item.id} className={item.id === currentCategory ? "active" : ""} onClick={() => updateSearchParams("category", item.id, true)}>{item.name}</li>
            ))}
          </ul>
        </aside>

        <main className="menu-main">
          <div className="menu-controls">
            <div className="search-box">
              <input type="text" placeholder="Search dishes..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <Search size={18} />
            </div>
            <div className="filter-sort">
              <select value={currentSort} onChange={(e) => updateSearchParams("sort", e.target.value, true)}>
                <option value="">Sort by</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Rendering product card */}
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                  onOpenModal={(prod) => setSelectedProduct(prod)} 
                />
              ))
            ) : (
              <p className="no-data">No products found.</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <ReactPaginate
                previousLabel={<ChevronLeft size={20} />} nextLabel={<ChevronRight size={20} />}
                onPageChange={(e) => updateSearchParams("page", e.selected + 1)}
                pageRangeDisplayed={3} marginPagesDisplayed={2} pageCount={totalPages}
                pageClassName="page-item" pageLinkClassName="page-link" previousClassName="page-item previous"
                previousLinkClassName="page-link" nextClassName="page-item next" nextLinkClassName="page-link"
                breakLabel="..." breakClassName="page-item" breakLinkClassName="page-link"
                containerClassName="pagination" activeClassName="active" renderOnZeroPageCount={null}
                forcePage={+currentPage - 1}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Menu;