import { useState, useEffect } from "react";
import axios from "axios";
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
    primary: { main: "#DA291C" }, // Texaco Red
    secondary: { main: "#007A33" }, // Texaco Green
    background: { default: "#EFEFEF" },
    text: { primary: "#101820" }, // Jet Black
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    item: "",
    size: "",
    quantity: 0,
    notes: "",
  });
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Load items
  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/items`);
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const saveItem = async () => {
    if (!form.item) return;
    await axios.post(`${API_URL}/items`, form);
    setForm({ item: "", size: "", quantity: 0, notes: "" });
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
    const headers = ["Item", "Size", "Quantity", "Notes"];
    const rows = items.map((i) => [i.item, i.size, i.quantity, i.notes]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "garage_inventory.csv";
    link.click();
  };

  const filteredItems = items.filter(
    (i) =>
      i.item.toLowerCase().includes(search.toLowerCase()) ||
      i.size.toLowerCase().includes(search.toLowerCase()) ||
      i.notes.toLowerCase().includes(search.toLowerCase())
  );

  // Totals
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const distinctSizes = new Set(items.map((i) => i.size)).size;

  const columns = [
    { field: "item", headerName: "Item", flex: 1 },
    { field: "size", headerName: "Size", flex: 0.8 },
    { field: "quantity", headerName: "Quantity", flex: 0.6 },
    { field: "notes", headerName: "Notes", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      renderCell: (params) => (
        <>
          <Button
            color="secondary"
            size="small"
            startIcon={<Edit />}
            onClick={() => {
              setEditItem(params.row.item);
              setEditQty(params.row.quantity);
            }}
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
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <AppBar position="static" color="primary" sx={{ boxShadow: 2 }}>
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

        {/* Main area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            p: 3,
            height: "calc(100vh - 64px)",
            overflow: "hidden",
          }}
        >
          {/* Add form */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <TextField
                label="Item"
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                fullWidth
              />
              <TextField
                label="Size"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                fullWidth
              />
              <TextField
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: +e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                fullWidth
              />
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Add />}
                onClick={saveItem}
                sx={{ minWidth: 150 }}
              >
                Add Item
              </Button>
            </Box>
          </Paper>

          {/* Totals + Search */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 1 }}
          >
            <Typography variant="body1" fontWeight="bold">
              Total Items: {totalItems} | Total Quantity: {totalQuantity} |
              Distinct Sizes: {distinctSizes}
            </Typography>
            <TextField
              placeholder="Search inventory..."
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
              flex: 1,
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
                <CircularProgress size={70} thickness={5} color="primary" />
              </Box>
            ) : (
              <DataGrid
                rows={filteredItems.map((i, idx) => ({ id: idx + 1, ...i }))}
                columns={columns}
                pageSize={8}
                rowsPerPageOptions={[8]}
                disableSelectionOnClick
                sx={{
                  border: "none",
                  flex: 1,
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#101820",
                    color: "#fff",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#fff4f4",
                  },
                }}
              />
            )}
          </Paper>
        </Box>

        {/* Edit quantity dialog */}
        <Dialog open={!!editItem} onClose={() => setEditItem(null)}>
          <DialogTitle>Edit Quantity</DialogTitle>
          <DialogContent>
            <TextField
              type="number"
              label="New Quantity"
              fullWidth
              value={editQty}
              onChange={(e) => setEditQty(+e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={updateQuantity} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm delete all */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Delete All</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>all</strong> inventory
              items?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={deleteAll}>
              Delete All
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
