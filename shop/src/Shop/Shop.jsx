import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faShoppingCart, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import "./Shop.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Shop() {
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")

  const numberWithCommas = (number) =>
    number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
  };

  const closeDetailModal = () => {
    setSelectedProduct(null);
  };
  const addToCart = () => {
    const existingItem = cartItems.find(
      (item) => item.id === selectedProduct.id
    );

    if (existingItem) {
      const updatedCartItems = cartItems.map((item) => {
        if (item.id === selectedProduct.id) {
          return { ...item, quantity: item.quantity + 1 };
        } else {
          return item;
        }
      });

      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { ...selectedProduct, quantity: 1 }]);
      setCartCount((prevCount) => prevCount + 1);
    }
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const cancelCart = () => {
    setShowCart(false);
  };

  const decreaseQuantity = (itemId) => {
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === itemId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      } else {
        return item;
      }
    });
    setCartItems(updatedCartItems);
  };

  const increaseQuantity = (itemId) => {
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, quantity: item.quantity + 1 };
      } else {
        return item;
      }
    });

    setCartItems(updatedCartItems);
  };

  const deleteItem = (itemId) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCartItems);
    setCartCount((prevCount) => prevCount - 1);
  };

  let totalPrice = 0;
  cartItems.forEach((item) => {
    totalPrice += item.productPrice * item.quantity;
  });

  const handleBuyButtonClick = () => {
    setShowCart(false);
    setShowOrderConfirmation(true);
  };

  //
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [subdistrict, setSubdistrict] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleOrderConfirmation = () => {
    const orderData = {
      fullName,
      address,
      subdistrict,
      district,
      province,
      postalCode,
      phoneNumber,
      totalPrice, // ต้องเพิ่ม state สำหรับ totalPrice ด้วย
      cartItems, // ต้องเพิ่ม state สำหรับ cartItems ด้วย
    };

    axios
      .post("http://localhost:3000/order", orderData)
      .then((response) => {
        // Use the response variable, for example:
        console.log(response.data.message);

        Swal.fire({
          icon: "success",
          title: "ยืนยันสั่งซื้อ",
          text: "คำสั่งซื้อของคุณได้รับการยืนยันเรียบร้อยแล้ว",
          confirmButtonText: "OK",
          customClass: {
            popup: 'p-1'
          }
        }).then(() => {
          setCartItems([]);
          setShowOrderConfirmation(true);
          setCartCount(0);
          setFullName("");
          setAddress("");
          setSubdistrict("");
          setDistrict("");
          setProvince("");
          setPostalCode("");
          setPhoneNumber("");
          setShowOrderConfirmation(false);
        });
      })
      .catch((error) => {
        console.error("เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ:", error);
      });
  };

  return (
    <section>
      <nav className="shop">
        <div className="con">
          <div className="box-img">
            <img
              src="https://i.pinimg.com/564x/11/82/a4/1182a469c0171ffea7aebb2d72b699e5.jpg"
              className="img"
            />
            <h2 className="f1">Shop</h2>
          </div>
          <div className="pi">
            <i onClick={toggleCart}>
              <FontAwesomeIcon icon={faShoppingCart} className="icon" />
            </i>
            {cartCount > 0 && <div className="cart">{cartCount}</div>}
          </div>
        </div>
      </nav>

      <div className="product">
        <div className="sidebar">
          <div>ค้นหา
            <input type="text"
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={() => setSearchTerm("")}><FontAwesomeIcon icon={faCircleXmark} />ลบ</button>
          </div>
        </div>
        <div className="product-all">
        {products
          .filter((item) =>
            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((item) => (
            <div
              onClick={() => openDetailModal(item)}
              className={`product-item ${item.type}`}
              key={item.id}
            >
              <img
                className="product-img"
                src={`http://localhost:3000/products/uploads/${item.productImage}`}
                alt={item.productName}
              />
              <p className="p-n">{item.productName}</p>
              <p className="p-m">{numberWithCommas(item.productPrice)} บาท</p>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <div className="model">
          <div></div>
          <div className="model-pg">
            <h2>Detail</h2>
            <div className="model-con">
              <img
                className="model-img"
                src={`http://localhost:3000/products/uploads/${selectedProduct.productImage}`}
              />
              <div className="detail">
                <p className="p-n">{selectedProduct.productName}</p>
                <p className="p-m">
                  {numberWithCommas(selectedProduct.productPrice)} บาท
                </p>
                <br />
                <p className="p-d">{selectedProduct.productDescription}</p>
              </div>
            </div>
            <div className="btn">
              <button onClick={closeDetailModal} className="btn-b">
                Close
              </button>
              <button
                onClick={() => {
                  addToCart();
                  closeDetailModal();
                }}
                className="btn-b btn-buy"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mycart" style={{ display: showCart ? "block" : "none" }}>
        <div></div>
        <div className="mycart-pg">
          <h2 className="m">My cart</h2>
          <br />
          <div className="cartlist">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-left">
                    <img
                      className="cart-img"
                      src={`http://localhost:3000/products/uploads/${item.productImage}`}
                    />
                    <div className="cart-detall">
                      <p className="p-n1">{item.productName}</p>
                      <p className="p-m1">
                        {numberWithCommas(item.productPrice * item.quantity)}{" "}
                        บาท
                      </p>
                    </div>
                  </div>
                  <div className="cart-right">
                    <p
                      onClick={() => decreaseQuantity(item.id)}
                      className="btnc"
                    >
                      -
                    </p>
                    <p className="num">{item.quantity}</p>
                    <p
                      onClick={() => increaseQuantity(item.id)}
                      className="btnc"
                    >
                      +
                    </p>
                    <i onClick={() => deleteItem(item.id)}>
                      <FontAwesomeIcon icon={faTrashCan} className="de" />
                    </i>
                  </div>
                </div>
              ))
            ) : (
              <div>ไม่พบสินค้า</div>
            )}
          </div>
          <div className="btn-c">
            <p className="p-a">ราคารวม {numberWithCommas(totalPrice)} บาท </p>

            <button onClick={cancelCart} className="btn-b">
              Cancel
            </button>
            <button className="btn-b btn-buy" onClick={handleBuyButtonClick}>
              Buy
            </button>
          </div>
        </div>
      </div>

      <div
        className="con-f"
        style={{ display: showOrderConfirmation ? "block" : "none" }}
      >
        <div className="c-all">
          <h2 className="c-f">คำสั่งชื้อ</h2>
          {cartItems.map((item) => (
            <div className="c-p" key={item.id}>
              <div className="c-i">
                <img
                  className="cart-img"
                  src={`http://localhost:3000/products/uploads/${item.productImage}`}
                />
                <div className="c-n-p">
                  <p className="p-n1">{item.productName}</p>
                  <p className="p-m1">
                    {numberWithCommas(item.productPrice)} บาท
                  </p>
                </div>
              </div>
              <div className="cart-right">
                <p className="c-q">{item.quantity} จำนวน</p>
              </div>
            </div>
          ))}
          <div className="a-r">
            <div className="a-r1">
              <p className="ar-n">ชื่อ-นามสกุล</p>
              <input
                className="fn-ln"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="a-r1">
              <p className="ar-n">ที่อยู่บ้านเลขที่</p>
              <input
                className="fn-ln"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="a-r1">
              <p className="ar-n">ตำบล</p>
              <input
                className="fn-ln"
                type="text"
                value={subdistrict}
                onChange={(e) => setSubdistrict(e.target.value)}
              />
            </div>
            <div className="a-r1">
              <p className="ar-n">อำเภอ</p>
              <input
                className="fn-ln"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
            <div className="a-r1">
              <p className="ar-n">จังหวัด</p>
              <input
                className="fn-ln"
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>
            <div className="a-r1">
              <p className="ar-n">รหัสไปรษณีย์</p>
              <input
                className="fn-ln"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div className="a-r1">
              <p className="ar-n">เบอร์โทรศัพ</p>
              <input
                className="fn-ln"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="c-s">
          <div className="c-tp">
            <p className="t-p">ราคารวม: {numberWithCommas(totalPrice)} บาท</p>
          </div>
          <div className="c-s1">
            <button
              className="btn-b"
              onClick={() => setShowOrderConfirmation(false)}
            >
              Cancel
            </button>
            <button onClick={handleOrderConfirmation} className="btn-b btn-buy">
              ยืบยันสั่งซื้อ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Shop;
