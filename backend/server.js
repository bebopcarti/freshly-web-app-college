const express = require("express");
const app = express();
const db = require("./db");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { type } = require("os");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend berjalan!");
});

app.listen(3001, "0.0.0.0", () => {
    console.log("Server berjalan di port 3001");
});

// === REGISTER - LOGIN ===
app.post("/register", (req, res) => {
    const { email, username, password } = req.body;
  
    const sql = "INSERT INTO user (email, username, password, createdat) VALUES (?, ?, ?, NOW())";
    const values = [email, username, password];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.log("Error:", err);
        return res.status(500).json({ message: "Gagal register" });
      }
      res.json({ message: "Register berhasil" });
    });
  });

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM user WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.log("Error:", err);
      return res.status(500).json({ message: "Gagal login" });
    }

    if (results.length > 0) {
      res.json({
        message: "Login berhasil",
        user: results[0]
      });
    } else {
      res.status(401).json({ message: "Username atau password salah" });
    }
  });
});
// --------------

// === ADMIN PAGE === (ADD PRODUCT)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/uploads/"); // simpan di folder uploads/
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

app.post("/tambah-produk", upload.single("gambar"), (req, res) => {
  const { nama, kategori, harga, stock } = req.body;
  const gambar = req.file ? req.file.filename : null;

  const sql = "INSERT INTO produk (nama, kategori, harga, stock, gambar, createdAt) VALUES (?, ?, ?, ?, ?, NOW())";

  db.query(sql, [nama, kategori, harga, stock, gambar], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Gagal menambah produk" });
    }

    res.json({ message: "Produk berhasil ditambahkan" });
  });
});

app.delete("/produk/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM produk WHERE produkId = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting product", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  });
});

app.post("/edit-produk/:id", (req, res, next) => {
  upload.single("gambar")(req, res, function (err) {
    if (err) return res.status(500).json({ message: "Upload error", error: err });

    const produkId = req.params.id;
    const { nama, kategori, harga, stock } = req.body;

    let updateQuery = "";
    let params = [];

    if (req.file) {
      updateQuery = `
        UPDATE produk
        SET nama = ?, kategori = ?, harga = ?, stock = ?, gambar = ?
        WHERE produkId = ?
      `;
      params = [nama, kategori, harga, stock, req.file.filename, produkId];
    } else {
      updateQuery = `
        UPDATE produk
        SET nama = ?, kategori = ?, harga = ?, stock = ?
        WHERE produkId = ?
      `;
      params = [nama, kategori, harga, stock, produkId];
    }

    db.query(updateQuery, params, (err, result) => {
      if (err) return res.status(500).json({ error: err });

      res.json({ message: "Produk berhasil diperbarui" });
    });
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ADMIN UPDATE ORDER STATUS
app.put("/order/update", (req, res) => {
  try {
    
    if (!req.body) {
      return res.status(400).json({ error: "Server missing JSON body parser middleware." });
    }

    const { orderId, status } = req.body;

    if (typeof db === 'undefined' || !db) {
      return res.status(500).json({ error: "Database variable is missing on the server layout." });
    }

    const sql = `
      UPDATE pengantaran 
      SET deliveryStatus = ? 
      WHERE orderId = ?
    `;

    db.query(sql, [status, orderId], (err, result) => {
      if (err) {
        console.error("SQL Query execution error:", err.message);
        return res.status(500).json({ error: "SQL execution failed", details: err.message });
      }
      
      return res.json({ success: true, affectedRows: result.affectedRows });
    });

  } catch (fatalError) {
    console.error(fatalError.stack); 
    
    return res.status(500).json({ 
      error: "The server encountered a fatal code error", 
      details: fatalError.message 
    });
  }
});

// ADMIN ANALYTICS
app.get("/analytics", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total_transactions,
      COALESCE(SUM(totalAmount), 0) AS total_revenue,
      COUNT(CASE WHEN createdAt = CURRENT_DATE() THEN 1 END) AS transactions_today,
      COALESCE(SUM(CASE WHEN createdAt = CURRENT_DATE() THEN totalAmount END), 0) AS revenue_today
    FROM \`order\`
    `

  db.query(sql, [], (err, result) => {
    if (err) {
      console.error("Error fetching order items: ", err);
      return res.status(500).json({ error: "Failed to fetch"});
    }
    return res.json(result)
  })
})
// --------------

// === STORE PAGE ===
app.get("/produk/kategori/:kategori", (req, res) => {
  const kategori = req.params.kategori;

  const sql = "SELECT * FROM produk WHERE kategori = ?";
  db.query(sql, [kategori], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error", error: err });
    }
    res.json(results);
  });
});

app.post("/produk/filter", (req, res) => {
  const categories = req.body;

  if (!Array.isArray(categories)) {
      return res.status(400).json({ message: "Invalid format" });
  }

  const sql = `SELECT * FROM produk WHERE kategori IN (?) ORDER BY produkId DESC`;

  db.query(sql, [categories], (err, result) => {
      if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error", error: err });
      }

      res.json(result);
  });
});

app.get("/produk", (req, res) => {
  const sql = "SELECT * FROM produk ORDER BY createdAt ASC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error mengambil produk", error: err });
    }
    res.json(results);
  });
});

app.post("/produk/price", (req, res) => {
  const { min, max } = req.body;

  let sql = "SELECT * FROM produk WHERE harga >= ? AND harga <= ? ORDER BY produkId DESC";

  db.query(sql, [min, max], (err, result) => {
      if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error", error: err });
      }
      res.json(result);
  });
});

app.post("/produk/filter/all", (req, res) => {
  const { categories, min, max, userId } = req.body; 

  let params = [];
  let sql = "";
  
  const checkFavorites = categories.includes("Favorites");
  const realCategories = categories.filter(c => c !== "Favorites");

  const ratingSubqueries = `
    p.*, 
    (SELECT COALESCE(AVG(rating), 5) FROM review WHERE produkId = p.produkId) AS produk_rating,
    (SELECT COUNT(*) FROM review WHERE produkId = p.produkId) AS total_reviews
  `;

  if (checkFavorites) {
      sql = `SELECT ${ratingSubqueries} FROM produk p INNER JOIN favorite f ON p.produkId = f.produkId WHERE f.userId = ? AND p.harga BETWEEN ? AND ?`;
      params.push(userId);
  } else {
      sql = `SELECT ${ratingSubqueries} FROM produk p WHERE p.harga BETWEEN ? AND ?`;
  }

  params.push(min, max);

  if (realCategories.length > 0) {
      const placeholders = realCategories.map(() => "?").join(",");
      sql += ` AND p.kategori IN (${placeholders})`;
      params.push(...realCategories);
  }
  
  sql += ` ORDER BY p.produkId DESC`;

  db.query(sql, params, (err, result) => {
      if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error", error: err });
      }
      res.json(result);
  });
});

app.post("/cart/add", (req, res) => {
  const { cartId, produkId } = req.body;

  const checkSql = `
    SELECT ci.cartItemId, ci.quantity, p.harga 
    FROM keranjang_item ci
    JOIN produk p ON ci.produkId = p.produkId
    WHERE ci.cartId = ? AND ci.produkId = ?
  `;
  
  db.query(checkSql, [cartId, produkId], (err, result) => {
    if (err) return res.status(500).json(err);

    // PRODUK SUDAH ADA DI CART
    if (result.length > 0) {
      const newQty = result[0].quantity + 1;
      const newSubtotal = newQty * result[0].harga;

      const updateSql = `
        UPDATE keranjang_item
        SET quantity = ?, subtotal = ?
        WHERE cartItemId = ?
      `;

      db.query(updateSql, [newQty, newSubtotal, result[0].cartItemId], () => {
        res.json({ message: "Quantity updated" });
      });

      return;
    }

    // PRODUK BELUM ADA DI CART
    db.query("SELECT harga FROM produk WHERE produkId = ?", [produkId], (err2, prod) => {
      if (err2) return res.status(500).json(err2);

      const price = prod[0].harga;

      const insertSql = `
        INSERT INTO keranjang_item (cartId, produkId, quantity, subtotal)
        VALUES (?, ?, 1, ?)
        `;
        
        db.query(insertSql, [cartId, produkId, price], () => {
        res.json({ message: "Produk added to cart!" });
      });
    });
  });
});
// --------------

// === ITEM DETAILS PAGE ===
app.get("/store/:produkId", (req, res) => {
  const { produkId } = req.params;

  const sql = `
    SELECT 
      p.nama,
      p.harga,
      p.gambar,
      u.username,
      r.komentar,
      r.rating,
      (SELECT COALESCE(AVG(rating), 5) FROM review WHERE produkId = p.produkId) AS produk_rating
    FROM produk p
    LEFT JOIN review r ON r.produkId = p.produkId
    LEFT JOIN user u ON r.userId = u.userId
    WHERE p.produkId = ?
  `;

  db.query(sql, [produkId], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    res.json(result);
  })
})

// ITEM REVIEW
app.get("/review/:produkId", (req, res) => {
  const {produkId} = req.params;

  const sql = `
    SELECT
      komentar
      AVG(rating)
    FROM review
    WHERE review.produkId = ?
  `;

  db.query(sql, [produkId], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

      res.json(result);
  });
})

app.post("/review/create", (req, res) => {
  const { produkId, userId, rating, komentar } = req.body;

  const sql = `
    INSERT INTO review (userId, produkId, rating, komentar, createdAt)
    VALUES (?, ?, ?, ?, NOW())
  `

  db.query(sql, [userId, produkId, rating, komentar], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Failed to create review" });
    }

    res.json(result);
  })
})

app.delete("/review/delete", (req, res) => {
  const { produkId, userId } = req.body;

  const sql = `
    DELETE FROM review
    WHERE review.produkId = ? AND review.userId = ?
  `
  db.query(sql, [produkId, userId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
})

// FAVORITE ITEM
app.get("/favorite/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT produkId FROM favorite WHERE userId = ?";
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    // Extract just the product IDs into a clean flat array: [1, 5, 12]
    const favoritedIds = results.map(row => row.produkId);
    res.json(favoritedIds);
  });
});

app.post("/favorite/update", (req, res) => {
  const { produkId, userId } = req.body;

  const sql = `
    INSERT INTO favorite (userId, produkId, createdAt)
    VALUES (?, ?, NOW())
  `

  db.query(sql, [userId, produkId], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Failed to favorite" });
    }

    res.json(result);
  })
})

app.delete("/favorite/delete", (req, res) => {
  const { produkId, userId } = req.body;

  const sql = `
    DELETE FROM favorite
    WHERE favorite.produkId = ? AND favorite.userId = ?
  `
  db.query(sql, [produkId, userId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
})
// --------------

// === CART PAGE ===
app.get("/cart/items/:cartId", (req, res) => {
  const { cartId } = req.params;

  const sql = `
    SELECT 
      ci.cartItemId,
      ci.quantity,
      ci.subtotal,
      p.produkId,
      p.nama,
      p.harga,
      p.gambar
    FROM keranjang_item ci
    JOIN produk p ON ci.produkId = p.produkId
    WHERE ci.cartId = ?
  `;

  db.query(sql, [cartId], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    res.json(result);
  });
});


app.post("/cart/getOrCreate", (req, res) => {
  const { userId } = req.body;

  db.query(
    "SELECT * FROM keranjang WHERE userId = ? LIMIT 1",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      if (result.length > 0) {
        return res.json({ cartId: result[0].cartId });
      }

      db.query(
        "INSERT INTO keranjang (userId, createdAt, updatedAt) VALUES (?, NOW(), NOW())",
        [userId],
        (err2, result2) => {
          if (err2) return res.status(500).json({ error: err2 });

          res.json({ cartId: result2.insertId });
        }
      );
    }
  );
});

app.put("/cart/item/update", (req, res) => {
  const { cartItemId, quantity } = req.body;

  const sql = `
    UPDATE keranjang_item ci
    JOIN produk p ON ci.produkId = p.produkId
    SET ci.quantity = ?, ci.subtotal = quantity * p.harga
    WHERE ci.cartItemId = ?
  `;

  db.query(sql, [quantity, cartItemId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

app.delete("/cart/item/remove/:cartItemId", (req, res) => {
  const { cartItemId } = req.params;

  db.query("DELETE FROM keranjang_item WHERE cartItemId = ?", [cartItemId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});
// --------------

// === TRANSACTION/CHECKOUT PAGE ===
app.post("/checkout", (req, res) => {
  const { userId, method, address } = req.body;

  // 1. Ambil cartId
  const getCartSql = "SELECT cartId FROM keranjang WHERE userId = ? LIMIT 1";

  db.query(getCartSql, [userId], (err, cartResult) => {
      if (err) return res.status(500).json(err);
      if (cartResult.length === 0) return res.status(400).json({ error: "Cart not found" });

      const cartId = cartResult[0].cartId;

      // 2. Ambil isi cart
      const getItemsSql = `
          SELECT ci.*, p.harga 
          FROM keranjang_item ci
          JOIN produk p ON ci.produkId = p.produkId
          WHERE ci.cartId = ?
      `;

      db.query(getItemsSql, [cartId], (err2, items) => {
          if (err2) return res.status(500).json(err2);
          if (items.length === 0) return res.status(400).json({ error: "Cart empty" });

          // Hitung total
          const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.harga, 0);

          // 3. Insert ke ORDER
          const insertOrderSql = `
              INSERT INTO \`order\` (userId, totalAmount, address, orderStatus, createdAt)
              VALUES (?, ?, ?, 'PLACED', NOW())
          `;

          db.query(insertOrderSql, [userId, totalAmount, address], (err3, orderResult) => {
              if (err3) return res.status(500).json(err3);

              const orderId = orderResult.insertId;

              // 4. Insert banyak item ke order_item
              const orderItemsValues = items.map(i => [
                  orderId,
                  i.produkId,
                  i.quantity,
                  i.harga,
                  i.quantity * i.harga
              ]);

              const insertOrderItemsSql = `
                  INSERT INTO order_item (orderId, produkId, quantity, harga, subtotal)
                  VALUES ?
              `;

              db.query(insertOrderItemsSql, [orderItemsValues], (err4) => {
                  if (err4) return res.status(500).json(err4);

                  // 5. Insert ke pembayaran
                  const insertPaymentSql = `
                    INSERT INTO pembayaran (orderId, method, paymentStatus, paymentDate)
                    VALUES (?, ?, 'PAYED', NOW())
                  `;

                  db.query(insertPaymentSql, [orderId, method], (err5) => {
                    if (err5) return res.status(500).json(err5);

                    const insertDeliverySql = `
                      INSERT INTO pengantaran (orderId, deliveryStatus, deliveryDate)
                      VALUES (?, 'PLACED', NOW())
                    `;

                    db.query(insertDeliverySql, [orderId], (err6) => {
                      if (err6) {console.error("Delivery insert failed", err6);}

                      // 6. Hapus cart item
                      db.query("DELETE FROM keranjang_item WHERE cartId = ?", [cartId]);

                      res.json({
                        message: "Checkout success",
                        orderId,
                        totalAmount
                      });
                    });
                  });
              });
          });
      });
  });
});
// --------------

// === TRANSACTION HISTORY PAGE ===
app.get('/transaction-history/:userId', (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId in path" });
  }

  let sql = ``;
  let params = [];

  if (userId === '2') {
    sql = `
        SELECT 
            p.paymentId, 
            p.orderId, 
            p.paymentDate,
            p.method,
            o.userId,
            pp.deliveryStatus
        FROM 
            pembayaran p
        INNER JOIN 
            \`order\` o ON p.orderId = o.orderId
        INNER JOIN
            pengantaran pp ON pp.orderId = o.orderId
        ORDER BY
            p.paymentDate DESC;
    `;
  } else {
    sql = `
        SELECT 
            p.paymentId, 
            p.orderId, 
            p.paymentDate,
            p.method,
            o.userId,
            pp.deliveryStatus
        FROM 
            pembayaran p
        INNER JOIN 
            \`order\` o ON p.orderId = o.orderId
        INNER JOIN
            pengantaran pp ON pp.orderId = o.orderId
        WHERE 
            o.userId = ?
        ORDER BY
            p.paymentDate DESC;
    `;
    params = [userId];
  }
  
  db.query(sql, [userId], (err, data) => {
    if (err) {
        console.error("Database query error for transaction history:", err);
        return res.status(500).json({ error: "Database query error" });
    }
    
    return res.json(data);
  });
});

app.get('/transaction-history/:userId/:orderId', (req, res) => {
  const { userId, orderId } = req.params;

  const sql = `
        SELECT 
            p.nama, 
            oi.produkId, 
            oi.quantity, 
            oi.harga, 
            oi.subtotal
        FROM order_item oi
        INNER JOIN produk p ON oi.produkId = p.produkId
        WHERE oi.orderId = ?
    `;
  
  db.query(sql, [orderId], (err, data) => {
  if (err) {
      console.error("Error fetching order items: ", err);
      return res.status(500).json({ error: "Failed to fetch order items",orderId});
  }
    return res.json(data);
  });
});
// --------------


// === PROGRESS PAGE ===
app.get('/progress/:userId/:orderId', (req, res) => {
  const { userId, orderId } = req.params;

  const sql = `
    SELECT 
      o.orderId,
      o.userId,
      o.totalAmount,
      o.orderStatus,
      p.deliveryStatus,
      p.deliveryDate,
      o.createdAt
    FROM \`order\` o
    JOIN \`pengantaran\` p ON o.orderId = p.orderId
    WHERE o.userId = ? AND o.orderId = ?
    LIMIT 1
  `;

  db.query(sql, [userId, orderId], (err, result) => {
      if (err) {
          console.error("DB error:", err);
          return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
          return res.status(404).json({ error: "Order not found" });
      }

      res.json(result);
  });
});
// --------------
