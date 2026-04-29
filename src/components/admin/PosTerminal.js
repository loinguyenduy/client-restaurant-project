import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  CreditCard,
  Banknote,
  Loader,
  ExternalLink,
} from "lucide-react";
import {
  getAllProductsAdminApi,
  getAllTablesApi,
  createPosOrderApi,
} from "../../services/adminService";
import { toast } from "react-toastify";
import "./PosTerminal.scss";

const PosTerminal = () => {
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [waitingPayos, setWaitingPayos] = useState({
    isWaiting: false,
    url: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, tableRes] = await Promise.all([
        getAllProductsAdminApi("all", 1, 100),
        getAllTablesApi(),
      ]);
      if (prodRes.EC === 0) setProducts(prodRes.DT.products);
      if (tableRes.EC === 0)
        setTables(tableRes.DT.filter((t) => t.status === "available"));
    } catch (e) {
      toast.error("Error loading POS data");
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.product_id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (id) =>
    setCart(cart.filter((item) => item.product_id !== id));

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.08;
    return { subtotal, tax, final: subtotal + tax };
  };

  const handlePlaceOrder = async () => {
    if (!selectedTable) return toast.warning("Please select a table!");
    if (cart.length === 0) return toast.warning("Cart is empty!");

    setIsSubmitting(true);
    const payload = {
      table_id: selectedTable,
      payment_method: paymentMethod,
      items: cart.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
      // ÉP PAYOS QUAY VỀ TRANG POS TERMINAL THAY VÌ TRANG CỦA CUSTOMER
      return_url: `${window.location.origin}/admin/pos`,
      cancel_url: `${window.location.origin}/admin/pos`,
    };

    try {
      const res = await createPosOrderApi(payload);
      if (res && res.EC === 0) {
        if (paymentMethod === "payos") {
          // Mở thẳng tab mới và hiện thông báo chờ
          window.open(res.DT, "_blank");
          setWaitingPayos({ isWaiting: true, url: res.DT });
        } else {
          toast.success("Order placed successfully (Cash)!");
          resetPOS();
        }
      } else toast.error(res.EM);
    } catch (e) {
      toast.error("Server error");
    }
    setIsSubmitting(false);
  };

  const resetPOS = () => {
    setCart([]);
    setSelectedTable("");
    setWaitingPayos({ isWaiting: false, url: "" });
    fetchData();
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="pos-container">
      {/* CỘT TRÁI: MENU */}
      <div className="pos-menu-section">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="products-grid">
          {filteredProducts.map((prod) => (
            <div
              className="pos-product-card"
              key={prod.id}
              onClick={() => addToCart(prod)}
            >
              <div className="img-wrapper">
                <img
                  src={prod.image_url || "https://via.placeholder.com/150"}
                  alt=""
                />
              </div>
              <div className="info">
                <h4>{prod.name}</h4>
                <span>${prod.price}</span>
                <div className="stock">Stock: {prod.stock_quantity ?? 0}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG & THANH TOÁN */}
      <div className="pos-cart-section">
        <div className="cart-header">
          <h3>Current Order</h3>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="">Select Table</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.table_number}
              </option>
            ))}
          </select>
        </div>

        <div className="cart-items-list">
          {cart.map((item) => (
            <div className="cart-item" key={item.product_id}>
              <div className="item-info">
                <span className="qty">x{item.quantity}</span>
                <span className="name">{item.name}</span>
              </div>
              <div className="item-price">
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.product_id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-line">
            <span>Subtotal</span>
            <span>${calculateTotal().subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Tax (8%)</span>
            <span>${calculateTotal().tax.toFixed(2)}</span>
          </div>
          <div className="total-line">
            <span>Total</span>
            <span>${calculateTotal().final.toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-methods">
          <button
            className={paymentMethod === "cash" ? "active" : ""}
            onClick={() => setPaymentMethod("cash")}
          >
            <Banknote size={18} /> Cash
          </button>
          <button
            className={paymentMethod === "payos" ? "active" : ""}
            onClick={() => setPaymentMethod("payos")}
          >
            <CreditCard size={18} /> PayOS
          </button>
        </div>

        <button
          className="btn-place-order"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader className="spin" /> : "Place Order"}
        </button>
      </div>

      {/* MODAL CHỜ THANH TOÁN PAYOS */}
      {waitingPayos.isWaiting && (
        <div className="qr-modal-overlay">
          <div
            className="qr-modal"
            style={{
              maxWidth: "450px",
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <h3>Awaiting PayOS Payment</h3>
            <p style={{ color: "#64748B", marginBottom: "20px" }}>
              Table:{" "}
              <strong>
                {tables.find((t) => t.id === selectedTable)?.table_number}
              </strong>
            </p>

            <div
              style={{
                background: "#F8FAFC",
                padding: "24px",
                borderRadius: "12px",
                marginBottom: "24px",
              }}
            >
              <ExternalLink
                size={40}
                color="#2563EB"
                style={{ marginBottom: "12px" }}
              />
              <p
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "14px",
                  color: "#334155",
                }}
              >
                A new tab has been opened for the payment gateway.
              </p>
              <button
                onClick={() => window.open(waitingPayos.url, "_blank")}
                style={{
                  background: "#DBEAFE",
                  color: "#1D4ED8",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  width: "100%",
                }}
              >
                Re-open Payment Link
              </button>
            </div>

            <p
              className="total-amount"
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#0F172A",
                marginBottom: "24px",
              }}
            >
              Total: ${calculateTotal().final.toFixed(2)}
            </p>
            <div className="modal-actions">
              <button
                onClick={resetPOS}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#16A34A",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Close / Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosTerminal;
