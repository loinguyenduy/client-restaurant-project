import React, { useEffect, useState } from 'react';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import './Menu.scss';
import { getAllCategories } from '../../services/categoryService';

const Menu = () => {
  // // Mock Data for Categories
  // const categories = [
  //   { id: '1', name: 'All' },
  //   { id: '2', name: 'Main Courses' },
  //   { id: '3', name: 'Appetizers' },
  //   { id: '4', name: 'Desserts' },
  //   { id: '5', name: 'Drinks' },
  // ];

  const [categories, setCategories] = useState([])
  // Mock Data for Products
  const products = [
    {
      id: 'p1',
      name: 'Grilled Ribeye Steak',
      description: 'Premium beef served with asparagus and red wine sauce.',
      price: '45.00',
      image_url: 'https://images.unsplash.com/photo-1546248136-3d215ec9f54e?auto=format&fit=crop&w=800'
    },
    {
      id: 'p2',
      name: 'Atlantic Salmon',
      description: 'Fresh salmon fillet with lemon butter sauce and herbs.',
      price: '38.50',
      image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800'
    },
    {
      id: 'p3',
      name: 'Classic Caesar Salad',
      description: 'Crispy romaine lettuce, parmesan cheese, and croutons.',
      price: '18.00',
      image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800'
    }
  ];

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    let res = await getAllCategories();
    if (res && res.EC === 0){
      setCategories(res.DT)
    }
  }
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
              <li key={item.id} className={item.name === 'All' ? 'active' : ''}>
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