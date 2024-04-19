const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 3000;

// กำหนดค่าการเชื่อมต่อฐานข้อมูล MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "shop-ramos",
});

// เชื่อมต่อกับฐานข้อมูล
db.connect((err) => {
  if (err) {
    console.error("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:", err);
    throw err;
  }
  console.log("เชื่อมต่อฐานข้อมูลสำเร็จ");
});

// สร้าง API endpoint สำหรับดึงข้อมูลจากฐานข้อมูล
app.get("/users", (req, res) => {
  // ส่งคำสั่ง SQL ดึงข้อมูลจากตาราง users
  db.query("SELECT * FROM user", (error, results) => {
    if (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
      return;
    }
    res.json(results); // ส่งข้อมูลเป็น JSON กลับไปยัง client
  });
});

// register
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Invalid email format: อีเมลไม่ถูกต้อง" });
  }

  db.query(
    "SELECT * FROM user WHERE username = ?",
    [username],
    async (err, usernameResults) => {
      if (err) {
        console.error("Error checking existing username:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      db.query(
        "SELECT * FROM user WHERE email = ?",
        [email],
        async (err, emailResults) => {
          if (err) {
            console.error("Error checking existing email:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          if (usernameResults.length > 0) {
            return res.status(400).json({ error: "Username already in use" });
          } else if (emailResults.length > 0) {
            return res.status(400).json({ error: "Email already in use" });
          } else {
            if (password.length < 6) {
              return res
                .status(400)
                .json({ error: "Password must be at least 6 characters long" });
            }
            try {
              const hashedPassword = await bcrypt.hash(password, 10);

              db.query(
                "INSERT INTO user(username, email, password) VALUES(?, ?, ?)",
                [username, email, hashedPassword],
                (err, result) => {
                  if (err) {
                    console.error("Error registering user:" + err);
                    res
                      .status(500)
                      .send(
                        "Error registering user: เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้"
                      );
                  } else {
                    res
                      .status(200)
                      .send(
                        "User register successfully : ลงทะเบียนผู้ใช้สำเร็จ"
                      );
                  }
                }
              );
            } catch (error) {
              console.error(
                "Error hashing password : เกิดข้อผิดพลาดในการแฮชรหัสผ่าน",
                error
              );
              res.status(500).json({
                error: "Internal Server Error : ข้อผิดพลาดเซิร์ฟเวอร์ภายใน",
              });
            }
          }
        }
      );
    }
  );
});

//login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db
      .promise()
      .query("SELECT * FROM user WHERE username = ?", [username]);
    const user = result[0][0];

    if (!user) {
      return res.status(401).json({ error: "Username not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error during login", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ตั้งค่า Multer สำหรับการอัปโหลดรูปภาพ
const addProductStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // กำหนดโฟลเดอร์ที่จะเก็บรูปภาพ
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // กำหนดชื่อไฟล์
  },
});

const addProductUpload = multer({ storage: addProductStorage });

// เพื่อเพิ่มสินค้า
app.post(
  "/add-product",
  addProductUpload.single("productImage"),
  (req, res) => {
    const { productName, productPrice, productDescription } = req.body;
    const productImage = req.file.filename;

    const sql =
      "INSERT INTO products (productName, productPrice, productDescription, productImage) VALUES (?, ?, ?, ?)";

    db.query(
      sql,
      [productName, productPrice, productDescription, productImage],
      (err, result) => {
        if (err) {
          console.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า:", err);
          res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มสินค้า" });
        } else {
          console.log("เพิ่มสินค้าสำเร็จ");
          res.status(200).json({ message: "เพิ่มสินค้าสำเร็จ" });
        }
      }
    );
  }
);

// อัปเดต
app.put(
  "/update-product/:productId",
  addProductUpload.single("productImage"),
  (req, res) => {
    const productId = req.params.productId;
    const { productName, productPrice, productDescription } = req.body;
    const productImage = req.file ? req.file.filename : null;

    // ดึงข้อมูลรูปภาพเดิมของสินค้าที่จะแก้ไข
    const getOldImageQuery = "SELECT productImage FROM products WHERE id=?";
    db.query(getOldImageQuery, [productId], (err, result) => {
      if (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพเดิม:", err);
        return res
          .status(500)
          .json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพเดิม" });
      }

      const oldProductImage = result[0].productImage;

      const sql =
        "UPDATE products SET productName=?, productPrice=?, productDescription=?, productImage=? WHERE id=?";

      db.query(
        sql,
        [
          productName,
          productPrice,
          productDescription,
          productImage || oldProductImage, // เลือกชื่อรูปภาพใหม่หรือรูปภาพเดิม
          productId,
        ],
        (err, result) => {
          if (err) {
            console.error("เกิดข้อผิดพลาดในการอัปเดตสินค้า:", err);
            return res
              .status(500)
              .json({ error: "เกิดข้อผิดพลาดในการอัปเดตสินค้า" });
          }

          // ถ้ามีการอัปโหลดรูปใหม่ และมีรูปเดิมให้ลบรูปเดิม
          if (req.file && oldProductImage) {
            const oldImagePath = path.join(
              __dirname,
              "uploads",
              oldProductImage
            );
            fs.unlink(oldImagePath, (err) => {
              if (err) {
                console.error("เกิดข้อผิดพลาดในการลบรูปเดิม:", err);
              }
            });
          }

          console.log("อัปเดตสินค้าสำเร็จ");
          res.status(200).json({ message: "อัปเดตสินค้าสำเร็จ" });
        }
      );
    });
  }
);

// เพิ่ม endpoint สำหรับลบสินค้า
app.delete("/delete-product/:productId", (req, res) => {
  const productId = req.params.productId;

  // ดึงข้อมูลรูปภาพเดิมของสินค้าที่จะลบ
  const getOldImageQuery = "SELECT productImage FROM products WHERE id=?";
  db.query(getOldImageQuery, [productId], (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพเดิม:", err);
      return res
        .status(500)
        .json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพเดิม" });
    }

    const oldProductImage = result[0].productImage;

    // ลบรูปภาพเดิม (ถ้ามี)
    if (oldProductImage) {
      const oldImagePath = path.join(__dirname, "uploads", oldProductImage);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error("เกิดข้อผิดพลาดในการลบรูปเดิม:", err);
        }
      });
    }

    // ลบสินค้าจากฐานข้อมูล
    const deleteProductQuery = "DELETE FROM products WHERE id=?";
    db.query(deleteProductQuery, [productId], (err, result) => {
      if (err) {
        console.error("เกิดข้อผิดพลาดในการลบสินค้า:", err);
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบสินค้า" });
      }

      console.log("ลบสินค้าสำเร็จ");
      res.status(200).json({ message: "ลบสินค้าสำเร็จ" });
    });
  });
});

// เพิ่ม endpoint สำหรับดึงข้อมูลสินค้าทั้งหมด
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", err);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" });
    } else {
      res.status(200).json(result);
    }
  });
});

// เพิ่ม endpoint สำหรับดึงรูปภาพสินค้า
app.use("/products/uploads", express.static("uploads"));

//คำสั้งซื้อ
app.post("/order", (req, res) => {
  // รับข้อมูลที่ส่งมาจากแอปพลิเคชัน React
  const {
    fullName,
    address,
    subdistrict,
    district,
    province,
    postalCode,
    phoneNumber,
    totalPrice,
    cartItems,
  } = req.body;

  // สร้างคำสั่ง SQL เพื่อเพิ่มข้อมูลคำสั่งซื้อลงในฐานข้อมูล
  const sql = `INSERT INTO orders (fullName, address, subdistrict, district, province, postalCode, phoneNumber, totalPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  // Execute SQL command
  db.query(
    sql,
    [
      fullName,
      address,
      subdistrict,
      district,
      province,
      postalCode,
      phoneNumber,
      totalPrice,
    ],
    (err, result) => {
      if (err) {
        console.error("เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ:", err);
        res
          .status(500)
          .json({ message: "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ" });
        return;
      }

      // เมื่อบันทึกคำสั่งซื้อสำเร็จ ให้ทำการเพิ่มรายการสินค้าที่ถูกสั่งซื้อลงในตาราง order_items
      const orderId = result.insertId;
      const orderItemsValues = cartItems
        .map((item) => `(${orderId}, ${item.id}, ${item.quantity})`)
        .join(", ");
      const orderItemsSql = `INSERT INTO order_items (orderId, productId, quantity) VALUES ${orderItemsValues}`;

      db.query(orderItemsSql, (err, result) => {
        if (err) {
          console.error("เกิดข้อผิดพลาดในการเพิ่มรายการสินค้า:", err);
          res
            .status(500)
            .json({ message: "เกิดข้อผิดพลาดในการเพิ่มรายการสินค้า" });
          return;
        }

        // ส่งข้อความแจ้งเตือนว่าการสั่งซื้อสำเร็จ
        res.status(200).json({ message: "บันทึกคำสั่งซื้อเรียบร้อยแล้ว" });
      });
    }
  );
});

// สร้าง API Endpoint เพื่อดึงข้อมูลคำสั่งซื้อ

app.get("/orders", (req, res) => {
  const sql = `
    SELECT 
        o.orderId,
        o.fullName,
        o.address,
        o.subdistrict,
        o.district,
        o.province,
        o.postalCode,
        o.phoneNumber,
        o.totalPrice,
        p.productName,
        p.productPrice,
        p.productImage,
        oi.quantity
    FROM 
        orders o
    INNER JOIN 
        order_items oi ON o.orderId = oi.orderId
    INNER JOIN 
        products p ON oi.productId = p.id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ error: "Error fetching orders" });
      return;
    }
    res.json(result);
  });
});
app.use("/orders/uploads", express.static("uploads"));

// เริ่มต้น Express server
app.listen(port, () => {
  console.log(`Server ทำงานที่ http://localhost:${port}`);
});
