import React, { useEffect, useState } from "react";
import { Search, Filter, ShoppingCart } from "lucide-react";
import "./Menu.scss";
import { getAllCategories } from "../../services/categoryService";
import { getAllProducts } from "../../services/productService";

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    let res = await getAllCategories();
    if (res && res.EC === 0) {
      setCategories(res.DT);
    }
  };

  const fetchProducts = async () => {
    let res = await getAllProducts();
    if (res && res.EC === 0) {
      setProducts(res.DT);
    }
  };
  return (
    <div className="menu-page">
      {/* Menu Banner */}
      <section className="menu-banner">
        <div className="banner-content">
          <h1>OUR MENU</h1>
          <p>Discover the finest culinary creations</p>
        </div>
      </section>

      <div className="menu-container">
        {/* Category Sidebar */}
        <aside className="category-sidebar">
          <h3 className="sidebar-title">Categories</h3>
          <ul className="category-list">
            {categories.map((item) => (
              <li key={item.id} className={item.name === "All" ? "active" : ""}>
                {item.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Menu Content */}
        <main className="menu-main">
          {/* Menu Controls (UI Only) */}
          <div className="menu-controls">
            <div className="search-box">
              <input type="text" placeholder="Search for dishes..." />
              <Search size={18} />
            </div>
            <div className="filter-sort">
              <select>
                <option>Sort by: Popularity</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {products.map((product) => (
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
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Menu;
