import { useState, useEffect } from "react";
import "./Order.css";

function Order() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []); // Removed dependency array

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:3000/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      const groupedOrders = groupOrdersByOrderId(data);
      setOrders(groupedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      setError("Failed to fetch orders. Please try again later.");
    }
  };

  const groupOrdersByOrderId = (orders) => {
    const groupedOrders = {};
    orders.forEach((order) => {
      const orderId = order.orderId;
      if (!groupedOrders[orderId]) {
        groupedOrders[orderId] = {
          orderDetails: { ...order },
          products: [],
          totalPrice: 0, // Initialize total price for each order group
        };
      }
      const productTotalPrice = order.productPrice * order.quantity;
      groupedOrders[orderId].products.push({
        productName: order.productName,
        productPrice: order.productPrice,
        quantity: order.quantity,
        totalPrice: productTotalPrice,
        productImage: order.productImage, // Include product image URL
      });
      groupedOrders[orderId].totalPrice += productTotalPrice; // Accumulate total price
    });
    return Object.values(groupedOrders);
  };

  return (
    <section>
      <div className="a-o">
        <div>
          <br />
          {error && <p>Error: {error}</p>}
          {orders.map((orderGroup) => (
            <div className="od-a" key={orderGroup.orderDetails.orderId}>
              <h1>ใบเสร็จที่: {orderGroup.orderDetails.orderId}</h1>
              {orderGroup.products.map((product, index) => (
                <div key={index} className="order">
                  <div className="or-1">
                    <p>
                      <img
                        className="o-img"
                        src={`http://localhost:3000/orders/uploads/${product.productImage}`}
                      />
                    </p>
                    <div className="or-2">
                    <p className="or-6">สินค้า: {product.productName}</p>
                    <p className="or-6">ราคา: {product.productPrice}</p>
                    <div className="or-3">
                      <p className="or-6">ราคารวม: {product.totalPrice}</p>
                    </div>
                    </div>
                  </div>
                  <p className="or-6 or-7">{product.quantity} จำนวน</p>
                </div>
              ))}
              <div className="or-4">
                <p className="or-6">ราคารวมทั้งหมด: {orderGroup.totalPrice}</p>
              </div>
              <div className="or-5">
                <p className="or-6">ที่จัดส่ง</p>
                <br />
                <p className="or-6">ชื่อ-นามสกุล: {orderGroup.orderDetails.fullName}</p>
                <p className="or-6">ที่อยู่บ้านเลขที่: {orderGroup.orderDetails.address}</p>
                <p className="or-6">ตำบล: {orderGroup.orderDetails.subdistrict}</p>
                <p className="or-6">อำเภอ: {orderGroup.orderDetails.district}</p>
                <p className="or-6">จังหวัด: {orderGroup.orderDetails.province}</p>
                <p className="or-6">รหัสไปรษณีย์: {orderGroup.orderDetails.postalCode}</p>
                <p className="or-6">เบอร์โทรศัพท์: {orderGroup.orderDetails.phoneNumber}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Order;
