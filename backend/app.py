from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import HTTPException

import sqlite3, datetime

app = FastAPI()

# Allow frontend (React) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database setup
def get_conn():
    return sqlite3.connect("inventory.db")


conn = get_conn()
conn.execute("""
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item TEXT UNIQUE,
    quantity INTEGER,
    notes TEXT,
    last_updated TEXT
)
""")
conn.close()


# Data model for validation
class Item(BaseModel):
    item: str
    quantity: int
    notes: str = ""


# --- ROUTES ---


@app.get("/items")
def get_items():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM inventory").fetchall()
    conn.close()
    return [
        dict(zip(["id", "item", "quantity", "notes", "last_updated"], r)) for r in rows
    ]


@app.post("/items")
def add_item(i: Item):
    conn = get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO inventory (item, quantity, notes, last_updated) VALUES (?, ?, ?, ?)",
        (i.item, i.quantity, i.notes, datetime.datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"status": "saved"}


@app.delete("/items/{item}")
def delete_item(item: str):
    conn = get_conn()
    conn.execute("DELETE FROM inventory WHERE item=?", (item,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}


@app.patch("/items/{item}")
def update_item_quantity(item: str, change: int):
    conn = get_conn()
    # Get current quantity
    cur = conn.execute("SELECT quantity FROM inventory WHERE item=?", (item,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Item not found")

    new_qty = row[0] + change  # e.g., change = -2 means subtract 2
    if new_qty < 0:
        new_qty = 0  # optional: don’t go below zero

    conn.execute(
        "UPDATE inventory SET quantity=?, last_updated=? WHERE item=?",
        (new_qty, datetime.datetime.now().isoformat(), item),
    )
    conn.commit()
    conn.close()
    return {"status": "updated", "item": item, "new_quantity": new_qty}


@app.put("/items/{item}")
def set_item_quantity(item: str, new_quantity: int):
    conn = get_conn()
    cur = conn.execute("SELECT id FROM inventory WHERE item=?", (item,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Item not found")

    conn.execute(
        "UPDATE inventory SET quantity=?, last_updated=? WHERE item=?",
        (new_quantity, datetime.datetime.now().isoformat(), item),
    )
    conn.commit()
    conn.close()
    return {"status": "updated", "item": item, "new_quantity": new_quantity}


@app.delete("/items")
def delete_all_items():
    conn = get_conn()
    conn.execute("DELETE FROM inventory")
    conn.commit()
    conn.close()
    return {"status": "all_deleted"}
