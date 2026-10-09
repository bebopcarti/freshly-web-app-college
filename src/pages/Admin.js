import { useState } from 'react';
import { useEffect } from 'react';
import './admin.css';
import { useAuth } from '../context/AuthContext';

function Admin() {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [stock, setStock] = useState("");
  const [harga, setHarga] = useState("");
  const [gambar, setGambar] = useState("");
  const [produk, setProduk] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const fd = new FormData();
    fd.append("nama", nama);
    fd.append("kategori", kategori);
    fd.append("harga", harga);
    fd.append("stock", stock);
    if (gambar) fd.append("gambar", gambar);
  
    let url = "";
    let method = "";
  
    if (editMode) {
      // UPDATE
      url = `http://localhost:3001/edit-produk/${editId}`;
      method = "POST";
    } else {
      // CREATE
      url = "http://localhost:3001/tambah-produk";
      method = "POST";
    }
  
    const response = await fetch(url, {
      method: method,
      body: fd
    });
  
    if (response.ok) {
      alert(editMode ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");
      fetchProduk(); // refresh data
  
      // reset form
      setEditMode(false);
      setEditId(null);
      setNama("");
      setKategori("");
      setHarga("");
      setStock("");
      setGambar(null);
    } else {
      alert("Gagal melakukan operasi");
    }
  };

  const fetchProduk = () => {
    fetch("http://localhost:3001/produk")
      .then(res => res.json())
      .then(data => setProduk(data))
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  const handleDelete = async (produkId) => {
    try {
      const response = await fetch(`http://localhost:3001/produk/${produkId}`, {
        method: "DELETE"
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Produk berhasil dihapus");
        fetchProduk();
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (produk) => {
    setEditMode(true);
    setEditId(produk.produkId);
  
    // isi form dengan nilai produk
    setKategori(produk.kategori);
    setNama(produk.nama);
    setHarga(produk.harga);
    setStock(produk.stock);
  };

  return (
    <>
    <div class="admin-body">
      <section className="tambah">
        <h2>Tambah Produk</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="nama" placeholder="Nama Produk" required 
          onChange={(e) => setNama(e.target.value)}/>
          <input type="text" name="kategori" placeholder="Kategori" required 
          onChange={(e) => setKategori(e.target.value)}/>
          <input type="text" name="stock" placeholder="Stock Produk" required 
          onChange={(e) => setStock(e.target.value)}/>
          <input type="number" name="harga" step="1000" placeholder="Harga" required 
          onChange={(e) => setHarga(e.target.value)}/>
          <input type="file" name="gambar" 
          onChange={(e) => setGambar(e.target.files[0]) }/> 
          <button type="submit">
            {editMode ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
        </form>
      </section>

      <section className="dashboard" id="dashboard">
        <div className="produk">
          <h2>Your Product</h2>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Image</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {produk.map((p) => (
                <tr key={p.produkId}>
                  <td>{p.nama}</td>
                  <td>{p.kategori}</td>
                  <td>
                    <img
                    src={`http://localhost:3001/uploads/${p.gambar}`}
                    alt={p.nama}
                    width="80"
                    />
                  </td>

                  <td>{p.harga}</td>
                  <td>{p.stock}</td>
                  <td style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button onClick={() => handleDelete(p.produkId)}>Hapus</button>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    </>
  );
}

export default Admin;