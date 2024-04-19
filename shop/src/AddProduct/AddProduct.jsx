import { useState } from "react";
import axios from "axios";
import ProductList from "./ProductList";
import {} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddProduct.css";

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState(null);
  const api = axios.create({
    baseURL: "http://localhost:3000", // ใส่ URL ของ Node.js server ที่รองรับ API
  });

  const handleImageChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("productPrice", productPrice);
    formData.append("productDescription", productDescription);
    formData.append("productImage", productImage);

    try {
      await api.post("/add-product", formData); // ใช้ api.post แทน axios.post
      toast.success("เพิ่มสินค้าสำเร็จ");
      setProductName("");
      setProductPrice("");
      setProductDescription("");
      setProductImage(null);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า:", error);
    }
  };

  return (
    <section className="add">
      <div>
        <h1 className="add-m">เพิ่มสินค้า</h1>
        <ToastContainer />
        <form className="f" onSubmit={handleSubmit}>
          <div className="n-p">
            <label className="add-name">ชื่อสินค้า:</label>
            <input
              className="i-n"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />

            <label className="p-name">ราคาสินค้า:</label>
            <input
              className="i-p"
              type="text"
              value={productPrice}
              onChange={(e) => {
                const enteredValue = e.target.value;

                // ตรวจสอบว่าข้อมูลที่ป้อนมาเป็นตัวเลขหรือไม่
                if (/^[0-9]*$/.test(enteredValue) || enteredValue === "") {
                  setProductPrice(enteredValue);
                }
              }}
            />
          </div>
          <div className="d-i">
            <label className="d-name">รายละเอียดสินค้า:</label>
            <textarea
              className="de-p"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
            </div>

            <label className="i-f">รูปภาพสินค้า:</label>
            <input className="i-img" type="file" accept="image/*" onChange={handleImageChange} />
          
          <button className="b-add" type="submit">เพิ่มสินค้า</button>
        </form>
      </div>
      <ProductList>รายการสินค้า ทั้งหมด</ProductList>
    </section>
  );
};
export default AddProduct;
