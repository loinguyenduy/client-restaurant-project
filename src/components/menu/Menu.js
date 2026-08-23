import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import ReactPaginate from "react-paginate";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getAllCategories } from "../../services/categoryService";
import { getAllProducts } from "../../services/productService";
import { addToCartApi } from "../../services/cartService";
import { doAddToCart, doSetCartFromServer } from "../../redux/actions/cartAction";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import "./Menu.scss";
import { getSocket } from "../../services/socketService";

const Menu = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, account } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const hasConnectedRef = useRef(false);

  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "";
  const currentPage = Math.max(Number.parseInt(searchParams.get("page"), 10) || 1, 1);
  const canOrder = !isAuthenticated || account.role === "customer";

  const updateSearchParams = useCallback((key, value, resetPage = false) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (!value || value === "all") next.delete(key);
      else next.set(key, String(value));
      if (resetPage) next.delete("page");
      return next;
    });
  }, [setSearchParams]);

  const closeProductModal = useCallback(() => setSelectedProduct(null), []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAllCategories();
        if (res?.EC === 0) setCategories(res.DT || []);
      } catch (error) {
        setErrorMessage("Categories could not be loaded.");
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams("search", searchInput.trim(), true);
    }, 500);
    return () => clearTimeout(timer);
    // Search parameters are intentionally updated only after typing pauses.
  }, [searchInput, updateSearchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const res = await getAllProducts({
          category_id: currentCategory,
          search: searchParams.get("search") || "",
          sort: currentSort,
          page: currentPage,
          limit: 9,
        });
        if (res?.EC !== 0) throw new Error(res?.EM);

        const nextTotalPages = res.DT.totalPages || 0;
        if (nextTotalPages > 0 && currentPage > nextTotalPages) {
          updateSearchParams("page", nextTotalPages);
          return;
        }
        setProducts(res.DT.products || []);
        setTotalPages(nextTotalPages);
      } catch (error) {
        setProducts([]);
        setTotalPages(0);
        setErrorMessage(error?.EM || error?.message || "Menu items could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [currentCategory, currentPage, currentSort, retryCount, searchParams, updateSearchParams]);

  useEffect(() => {
    const socket = getSocket();
    const updateAvailability = (event) => {
      if (!event?.productId) return;
      if (event.deleted) {
        setProducts((current) => current.filter((product) => product.id !== event.productId));
        setSelectedProduct((current) => current?.id === event.productId ? null : current);
        return;
      }
      const applyChange = (product) => product.id === event.productId
        ? { ...product, stock_quantity: event.stock_quantity, is_available: event.is_available }
        : product;
      setProducts((current) => current.map(applyChange));
      setSelectedProduct((current) => current ? applyChange(current) : current);
    };
    const refetchAfterReconnect = () => {
      if (hasConnectedRef.current) setRetryCount((count) => count + 1);
      hasConnectedRef.current = true;
    };
    socket.on("product:availability_changed", updateAvailability);
    socket.on("connect", refetchAfterReconnect);
    return () => {
      socket.off("product:availability_changed", updateAvailability);
      socket.off("connect", refetchAfterReconnect);
    };
  }, []);

  const handleAddToCart = async (product, quantity) => {
    const isSoldOut = !product.is_available || product.stock_quantity <= 0;
    if (isSoldOut || quantity < 1) {
      toast.warning("This dish is currently sold out.");
      return false;
    }
    if (!canOrder) {
      toast.info("Customer ordering is not available from an internal account.");
      return false;
    }

    if (isAuthenticated) {
      try {
        const res = await addToCartApi(product.id, quantity);
        if (res?.EC === 0) {
          dispatch(doSetCartFromServer(res.DT));
          toast.success(`Added ${quantity} ${product.name} to your cart.`);
          return true;
        }
        toast.error(res?.EM || "Could not add this dish.");
      } catch (error) {
        toast.error(error?.EM || "Could not add this dish.");
      }
      return false;
    }

    const existingItem = cartItems.find((item) => item.product_id === product.id);
    const currentQuantity = existingItem?.quantity || 0;
    if (currentQuantity + quantity > product.stock_quantity) {
      toast.warning(`Only ${product.stock_quantity} of this dish are currently available.`);
      return false;
    }

    dispatch(doAddToCart(product, quantity));
    toast.success(`Added ${quantity} ${product.name} to your cart.`);
    return true;
  };

  return (
    <div className="menu-page">
      <ProductModal
        product={selectedProduct}
        categories={categories}
        canOrder={canOrder}
        onClose={closeProductModal}
        onAddToCart={handleAddToCart}
      />

      <section className="menu-banner">
        <div className="banner-content">
          <h1>OUR MENU</h1>
          <p>Discover the finest culinary creations</p>
        </div>
      </section>

      <div className="menu-container">
        <aside className="category-sidebar" aria-label="Menu categories">
          <h3 className="sidebar-title">Categories</h3>
          <ul className="category-list">
            <li><button className={currentCategory === "all" ? "active" : ""} onClick={() => updateSearchParams("category", "all", true)}>All Items</button></li>
            {categories.map((category) => (
              <li key={category.id}>
                <button className={String(category.id) === currentCategory ? "active" : ""} onClick={() => updateSearchParams("category", category.id, true)}>{category.name}</button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="menu-main">
          <div className="menu-controls">
            <label className="search-box">
              <span className="sr-only">Search dishes</span>
              <input type="search" placeholder="Search dishes..." value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
              <Search size={18} />
            </label>
            <select aria-label="Sort menu" value={currentSort} onChange={(event) => updateSearchParams("sort", event.target.value, true)}>
              <option value="">Newest dishes</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {isLoading ? (
            <div className="menu-state"><span className="menu-loader" />Loading dishes...</div>
          ) : errorMessage ? (
            <div className="menu-state error-state">
              <p>{errorMessage}</p>
              <button onClick={() => setRetryCount((count) => count + 1)}><RefreshCw size={16} /> Retry</button>
            </div>
          ) : products.length === 0 ? (
            <div className="menu-state"><p>No dishes match the current filters.</p></div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} canOrder={canOrder} onAddToCart={handleAddToCart} onOpenModal={setSelectedProduct} />
              ))}
            </div>
          )}

          {totalPages > 1 && !isLoading && !errorMessage && (
            <div className="pagination-container">
              <ReactPaginate
                previousLabel={<ChevronLeft size={20} />}
                nextLabel={<ChevronRight size={20} />}
                onPageChange={(event) => updateSearchParams("page", event.selected + 1)}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
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
                forcePage={Math.min(currentPage - 1, totalPages - 1)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Menu;
