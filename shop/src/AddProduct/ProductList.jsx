import { useState, useEffect } from "react";
import axios from "axios";
import "./ProductList.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faPenToSquare, faShareFromSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProductName, setEditedProductName] = useState("");
  const [editedProductPrice, setEditedProductPrice] = useState("");
  const [editedProductDescription, setEditedProductDescription] = useState("");
  const [editedProductImage, setEditedProductImage] = useState(null);
  const [originalProductImage, setOriginalProductImage] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลสินค้าทั้งหมดเมื่อคอมโพเนนต์ถูกโหลด
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/products");
      setProducts(response.data.reverse());
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", error);
    }
  };

  const handleEdit = (productId) => {
    // นำไปที่หน้าแก้ไขสินค้า โดยใช้ React Router หรือวิธีที่คุณต้องการ
    const productToEdit = products.find((product) => product.id === productId);
    setEditingProductId(productId);
    setEditedProductName(productToEdit.productName);
    setEditedProductPrice(productToEdit.productPrice);
    setEditedProductDescription(productToEdit.productDescription);
    setOriginalProductImage(productToEdit.productImage);
  };

  const handleSaveEdit = async () => {
    // ตรวจสอบว่ามีการเลือกรูปภาพใหม่หรือไม่
    const updatedImage = editedProductImage
      ? editedProductImage
      : originalProductImage;
    // ส่งข้อมูลที่แก้ไขไปยังเซิร์ฟเวอร์
    const formData = new FormData();
    formData.append("productName", editedProductName);
    formData.append("productPrice", editedProductPrice);
    formData.append("productDescription", editedProductDescription);
    formData.append("productImage", updatedImage);

    try {
      // ใช้ axios.put เพื่อส่ง PUT request ไปยังเซิร์ฟเวอร์
      await axios.put(
        `http://localhost:3000/update-product/${editingProductId}`,
        formData
      );

      // อัพเดทข้อมูลที่แก้ไขใน state
      const updatedProducts = products.map((product) =>
        product.id === editingProductId
          ? {
              ...product,
              productName: editedProductName,
              productPrice: editedProductPrice,
              productDescription: editedProductDescription,
              productImage: updatedImage, // Uncomment if you want to update the image
            }
          : product
      );

      setProducts(updatedProducts);

      // Clear the editing state
      setEditingProductId(null);
      setEditedProductName("");
      setEditedProductPrice("");
      setEditedProductDescription("");
      setEditedProductImage(null);
      setOriginalProductImage(null);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกการแก้ไข:", error);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`http://localhost:3000/delete-product/${productId}`);

      // ลบรายการที่ถูกลบออกจาก state
      const updatedProducts = products.filter(
        (product) => product.id !== productId
      );
      setProducts(updatedProducts);
    } catch (error) {
      console.log("เกิดข้อผิดพลาดในการลบสินค้า:", error);
    }
  };

  const handleCancelEdit = () => {
    // Clear the editing state
    setEditingProductId(null);
    setEditedProductName("");
    setEditedProductPrice("");
    setEditedProductDescription("");
    setEditedProductImage(null);
    setOriginalProductImage(null);
  };

  return (
    <div>
      <h1>รายการสินค้า</h1>
      <table className="pro-all">
        <thead>
          <tr>
            <th className="i-1">img</th>
            <th className="n-1">ชื่อสินค้า</th>
            <th className="pri-1">ราคา</th>
            <th className="de-1">รายละเอียด</th>
            <th className="ed">แก้ไข</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              {editingProductId === product.id ? (
                // แสดงฟอร์มแก้ไข
                <>
                  <td className="ip-1">
                    <img className="i-2"
                      src={`http://localhost:3000/products/uploads/${product.productImage}`}
                      alt={product.productName}
                      style={{ maxWidth: "100px" }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditedProductImage(e.target.files[0])}
                    />
                  </td>
                  <td className="i-2">
                    <input
                    className="in-1"
                      type="text"
                      value={editedProductName}
                      onChange={(e) => setEditedProductName(e.target.value)}
                    />
                  </td>
                  <td className="pri-1">
                    <input
                    className="pri-2"
                      type="text"
                      value={editedProductPrice}
                      onChange={(e) => setEditedProductPrice(e.target.value)}
                    />
                  </td>
                  <td className="de-2">
                    <textarea
                    className="i-de-2"
                      value={editedProductDescription}
                      onChange={(e) =>
                        setEditedProductDescription(e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button className="s-1" onClick={handleSaveEdit}><FontAwesomeIcon icon={faFloppyDisk} /> บันทึก</button>
                    <button className="c-1" onClick={handleCancelEdit}><FontAwesomeIcon icon={faShareFromSquare} /> Cancel</button>
                  </td>
                </>
              ) : (
                // แสดงข้อมูลสินค้า
                <>
                  <td className="img-1">
                    <img className="i-2"
                      src={`http://localhost:3000/products/uploads/${product.productImage}`}
                      alt={product.productName}
                    />
                  </td>
                  <td className="n-2">{product.productName}</td>
                  <td className="pri-3">{product.productPrice}</td>
                  <td className="n-2"><div className="n-2">{product.productDescription}</div></td>
                  <td>
                    <button className="ed-1" onClick={() => handleEdit(product.id)}>
                    <FontAwesomeIcon icon={faPenToSquare} />
                      แก้ไข
                    </button>
                    <button className="ed-2" onClick={() => handleDelete(product.id)}>
                    <FontAwesomeIcon icon={faTrash} /> ลบ</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
