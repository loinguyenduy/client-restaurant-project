import React, { useEffect, useState } from "react";
import { Search, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import ReactPaginate from "react-paginate";
import "./Menu.scss";
import { getAllCategories } from "../../services/categoryService";
import { getAllProducts } from "../../services/productService";
import { useSearchParams } from "react-router-dom";

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);

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

  // Debounce search logic: search function will be active when user stop enter input about 500ms
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
      if (!value || value === "all") {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }

      if (resetPage) {
        prev.delete("page");
      }
      return prev;
    });
  };

  const handlePageClick = (event) => {
    updateSearchParams("page", event.selected + 1);
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
                    <button className="add-to-cart-btn">
                      <ShoppingCart size={18} /> Add to Cart
                    </button>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.description}</p>
                    <span className="product-price">${product.price}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No products found.</p>
            )}
          </div>

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
