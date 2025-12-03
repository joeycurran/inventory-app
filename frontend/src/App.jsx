import { useState, useEffect } from "react";
import axios from "axios";
import SplashScreen from "./components/SplashScreen";
import { AnimatePresence, motion } from "framer-motion";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  CircularProgress,
  CssBaseline,
  createTheme,
  ThemeProvider,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add,
  Edit,
  Delete,
  DeleteForever,
  Search,
  Download,
} from "@mui/icons-material";

const API_URL = "https://inventory-app-1-9frl.onrender.com";

const theme = createTheme({
  palette: {
    primary: { main: "#DA291C" },
    secondary: { main: "#007A33" },
    background: { default: "#EFEFEF" },
    text: { primary: "#101820" },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

export default function App() {
  const [error, setError] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);

  const [form, setForm] = useState({
    item: "",
    size: "",
    quantity: "",
    price: "",
    notes: "",
  });
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash) loadItems();
  }, [showSplash]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/items`);
      setItems([...res.data].sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async () => {
    if (!form.item || !form.size) {
      setError("Please enter valid values.");
      return;
    }

    const qty = form.quantity === "" ? 0 : Number(form.quantity);
    const price = form.price === "" ? 0 : Number(form.price);

    if (isNaN(qty) || isNaN(price) || qty < 0 || price < 0) {
      setError("Please enter valid values.");
      return;
    }

    setError("");

    await axios.post(`${API_URL}/items`, {
      ...form,
      quantity: qty,
      price: price,
    });

    setForm({ item: "", size: "", quantity: "", price: "", notes: "" });
    loadItems();
  };
  const openEditDialog = (row) => {
    setEditData({ ...row });
  };
  const saveEditData = async () => {
    await axios.put(`${API_URL}/items/update/${editData.id}`, editData);
    setEditData(null);
    loadItems();
  };
  const updateQuantity = async () => {
    await axios.put(`${API_URL}/items/${editItem}`, null, {
      params: { new_quantity: editQty },
    });
    setEditItem(null);
    loadItems();
  };

  const deleteItem = async (name) => {
    await axios.delete(`${API_URL}/items/${name}`);
    loadItems();
  };

  const deleteAll = async () => {
    setConfirmOpen(false);
    await axios.delete(`${API_URL}/items`);
    loadItems();
  };

  const exportToCSV = () => {
    const headers = ["Item", "Size", "Quantity", "Price", "Notes"];
    const rows = items.map((i) => [
      i.item,
      i.size,
      i.quantity,
      i.price,
      i.notes,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "garage_inventory.csv";
    link.click();
  };

  const query = search.trim().toLowerCase();
  const filteredItems = !query
    ? items
    : items.filter((i) => {
        const values = [i.item, i.size, i.notes].map(
          (v) => v?.toLowerCase() || ""
        );
        return values.some((v) => v.includes(query));
      });

  const columns = [
    {
      field: "item",
      headerName: "Item",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "size",
      headerName: "Size",
      flex: 0.7,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "price",
      headerName: "Price (€)",
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        console.log("Price params:", params.value, typeof params.value);
        const num = params.value == null ? 0 : Number(params.value);
        return `€${num.toFixed(2)}`;
      },
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1.2,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <>
          <Button
            color="secondary"
            size="small"
            startIcon={<Edit />}
            onClick={() => openEditDialog(params.row)}
          >
            Edit
          </Button>
          <Button
            color="error"
            size="small"
            startIcon={<Delete />}
            onClick={() => deleteItem(params.row.item)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: "absolute", width: "100%", height: "100%" }}
          >
            <SplashScreen />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Box
              sx={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <AppBar position="static" color="primary">
                <Toolbar>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Tara Service Station Tyre Inventory & Storage
                  </Typography>
                  <Button
                    color="inherit"
                    startIcon={<Download />}
                    onClick={exportToCSV}
                  >
                    Export CSV
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<DeleteForever />}
                    onClick={() => setConfirmOpen(true)}
                  >
                    Delete All
                  </Button>
                </Toolbar>
              </AppBar>

              {/* Error message */}
              {error && (
                <Typography color="error" sx={{ mt: 1, ml: 3 }}>
                  {error}
                </Typography>
              )}

              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* Compact 3-column form */}
                <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Item"
                      value={form.item}
                      onChange={(e) =>
                        setForm({ ...form, item: e.target.value })
                      }
                      fullWidth
                    />
                    <TextField
                      label="Size"
                      value={form.size}
                      onChange={(e) =>
                        setForm({ ...form, size: e.target.value })
                      }
                      fullWidth
                    />
                    <TextField
                      label="Quantity"
                      type="number"
                      value={form.quantity}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm({
                          ...form,
                          quantity: v === "" ? "" : Number(v),
                        });
                      }}
                      fullWidth
                    />
                    <TextField
                      label="Price (€)"
                      type="number"
                      value={form.price}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm({ ...form, price: v === "" ? "" : Number(v) });
                      }}
                      fullWidth
                      InputProps={{ inputProps: { step: 0.01 } }}
                    />
                    <TextField
                      label="Notes"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<Add />}
                      onClick={saveItem}
                    >
                      Add Item
                    </Button>
                  </Box>
                </Paper>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}
                >
                  <TextField
                    placeholder="Search items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 300 }}
                  />
                </Box>
                {/* Table */}
                <Paper
                  sx={{
                    flexGrow: 1,
                    minHeight: "550px",
                    borderRadius: 2,
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <CircularProgress size={70} thickness={5} />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={filteredItems}
                      columns={columns}
                      pageSize={8}
                      rowsPerPageOptions={[8]}
                      disableSelectionOnClick
                    />
                  )}
                </Paper>
              </Box>

              {/* Edit Quantity */}
              <Dialog
                open={!!editData}
                onClose={() => setEditData(null)}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>Edit Item</DialogTitle>
                <DialogContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 1,
                  }}
                >
                  <TextField
                    label="Item"
                    value={editData?.item || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, item: e.target.value })
                    }
                    fullWidth
                  />

                  <TextField
                    label="Size"
                    value={editData?.size || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, size: e.target.value })
                    }
                    fullWidth
                  />

                  <TextField
                    label="Quantity"
                    type="number"
                    value={editData?.quantity || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        quantity: Number(e.target.value),
                      })
                    }
                    fullWidth
                  />

                  <TextField
                    label="Price (€)"
                    type="number"
                    value={editData?.price || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        price: Number(e.target.value),
                      })
                    }
                    fullWidth
                    InputProps={{
                      inputProps: { step: 0.01 },
                    }}
                  />

                  <TextField
                    label="Notes"
                    value={editData?.notes || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, notes: e.target.value })
                    }
                    fullWidth
                  />
                </DialogContent>

                <DialogActions>
                  <Button onClick={() => setEditData(null)}>Cancel</Button>
                  <Button variant="contained" onClick={saveEditData}>
                    Save
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Confirm delete all */}
              <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm Delete All</DialogTitle>
                <DialogContent>
                  <Typography>
                    Are you sure you want to delete all items?
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                  <Button variant="contained" color="error" onClick={deleteAll}>
                    Delete All
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
