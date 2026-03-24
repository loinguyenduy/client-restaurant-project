import React, { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import ReactPaginate from "react-paginate";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { getAllCategories } from "../../services/categoryService";
import { getAllProducts } from "../../services/productService";
import { addToCartApi } from "../../services/cartService";
import { doAddToCart } from "../../redux/actions/cartAction";

import "./Menu.scss";

const Menu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get authentication status from Redux store
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const cartItems = useSelector((state) => state.cart.cartItems); //get cart items from Redux to check quantities for guest users

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);

  // State to manage quantities for each product
  const [quantities, setQuantities] = useState({});

  const currentCategory = searchParams.get("category") || "all";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentPage = searchParams.get("page") || 1;

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams("search", searchInput, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchCategories = async () => {
    let res = await getAllCategories();
    if (res && res.EC === 0) setCategories(res.DT);
  };

  const fetchProducts = async () => {
    const options = {
      category_id: currentCategory,
      search: currentSearch,
      sort: currentSort,
      page: currentPage,
      limit: 9,
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

  const handlePageClick = (event) => {
    updateSearchParams("page", event.selected + 1);
  };

  // function to handle quantity changes
  const handleQuantityChange = (product, value, isInput = false) => {
    setQuantities((prev) => {
      const currentQty = prev[product.id] || 1;
      let newQty;

      if (isInput) {
        newQty = parseInt(value);
        if (isNaN(newQty) || newQty < 1) newQty = 1;
      } else {
        newQty = currentQty + value;
        if (newQty < 1) newQty = 1;
      }

      if (newQty > product.stock_quantity) {
        toast.warning(
          `We only have ${product.stock_quantity} portions of ${product.name} left!`,
        );
        newQty = product.stock_quantity; 
      }

      return { ...prev, [product.id]: newQty };
    });
  };

  // function to handle adding products to cart
  const handleAddToCart = async (product) => {
    // if (!isAuthenticated) {
    //   toast.info("Please log in to add items to your cart.");
    //   navigate("/login");
    //   return;
    // }

    const qtyToAdd = quantities[product.id] || 1; // get the quantity for this product, default to 1 if not set

    //if user is authenticated, call API to save in Database
    if (isAuthenticated) {
      try {
        // Gọi API lưu vào Database
        let res = await addToCartApi(product.id, qtyToAdd);

        if (res && res.EC === 0) {
          toast.success(`Added ${qtyToAdd} ${product.name} to your cart!`);
          // Cập nhật lên Redux để giao diện nhảy số lượng
          dispatch(doAddToCart(product, qtyToAdd));
          setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
        } else {
          toast.error(res.EM || "Could not add to cart.");
        }
      } catch (error) {
        toast.error("Server error. Please try again.");
      }
    }
    // if guest user, only save in Redux 
    else {
      const existingItem = cartItems.find(
        (item) => item.product_id === product.id,
      );
      const currentQtyInCart = existingItem ? existingItem.quantity : 0;

      if (currentQtyInCart + qtyToAdd > product.stock_quantity) {
        toast.warning(
          `You already have ${currentQtyInCart} in cart. We only have ${product.stock_quantity} left!`,
        );
        return; 
      }

      dispatch(doAddToCart(product, qtyToAdd));
      toast.success(
        `Added ${qtyToAdd} ${product.name} to your temporary cart!`,
      );
      setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    }
  };

  return (
    <div className="menu-page">
      <section className="menu-banner">
        <div className="banner-content">
          <h1>OUR MENU</h1>
          <p>Discover the finest culinary creations</p>
        </div>
      </section>

      <div className="menu-container">
        {/* Sidebar */}
        <aside className="category-sidebar">
          <h3 className="sidebar-title">Categories</h3>
          <ul className="category-list">
            <li
              className={currentCategory === "all" ? "active" : ""}
              onClick={() => updateSearchParams("category", "all", true)}
            >
              All Items
            </li>
            {categories.map((item) => (
              <li
                key={item.id}
                className={item.id === currentCategory ? "active" : ""}
                onClick={() => updateSearchParams("category", item.id, true)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="menu-main">
          <div className="menu-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search size={18} />
            </div>
            <div className="filter-sort">
              <select
                value={currentSort}
                onChange={(e) =>
                  updateSearchParams("sort", e.target.value, true)
                }
              >
                <option value="">Sort by</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image_url} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.description}</p>
                    <span className="product-price">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>

                    <div className="cart-action-group">
                      <div className="quantity-control">
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(product, -1)}
                        >
                          <Minus size={16} />
                        </button>

                        <input
                          type="number"
                          className="qty-input"
                          value={quantities[product.id] || 1}
                          onChange={(e) =>
                            handleQuantityChange(product, e.target.value, true)
                          }
                          min="1"
                        />

                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(product, 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No products found.</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <ReactPaginate
                previousLabel={<ChevronLeft size={20} />}
                nextLabel={<ChevronRight size={20} />}
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                marginPagesDisplayed={2}
                pageCount={totalPages}
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item previous"
                previousLinkClassName="page-link"
                nextClassName="page-item next"
                nextLinkClassName="page-link"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="pagination"
                activeClassName="active"
                renderOnZeroPageCount={null}
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
