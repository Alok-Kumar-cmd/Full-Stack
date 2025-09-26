const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// -----------------------------
// In-memory seat storage
// -----------------------------
const NUM_SEATS = 10;
let seats = {}; 
for (let i = 1; i <= NUM_SEATS; i++) {
  seats[i] = {
    id: i,
    status: "available", // available | locked | booked
    lockedBy: null,
    lockExpiresAt: null,
  };
}

// -----------------------------
// Helper: auto-expire locks
// -----------------------------
function expireLocks() {
  const now = Date.now();
  for (let seatId in seats) {
    let seat = seats[seatId];
    if (seat.status === "locked" && seat.lockExpiresAt <= now) {
      seat.status = "available";
      seat.lockedBy = null;
      seat.lockExpiresAt = null;
      console.log(Lock expired for seat ${seatId});
    }
  }
}
setInterval(expireLocks, 5000); // check every 5 seconds

// -----------------------------
// GET /seats -> view seats
// -----------------------------
app.get("/seats", (req, res) => {
  expireLocks(); // ensure state is updated
  res.json(Object.values(seats));
});

// -----------------------------
// POST /lock/:seatId?userId=xyz
// -----------------------------
app.post("/lock/:seatId", (req, res) => {
  const seatId = req.params.seatId;
  const userId = req.query.userId;

  if (!userId) return res.status(400).json({ error: "Missing userId" });
  if (!seats[seatId]) return res.status(404).json({ error: "Seat not found" });

  expireLocks();
  let seat = seats[seatId];

  if (seat.status === "booked") {
    return res.status(400).json({ error: "Seat already booked" });
  }

  if (seat.status === "locked") {
    if (seat.lockedBy === userId) {
      return res.json({ message: Seat ${seatId} already locked by you });
    } else {
      return res.status(400).json({ error: "Seat currently locked by another user" });
    }
  }

  // Lock the seat
  seat.status = "locked";
  seat.lockedBy = userId;
  seat.lockExpiresAt = Date.now() + 60000; // 1 min lock

  return res.json({ message: Seat ${seatId} locked successfully for 1 minute, seat });
});

// -----------------------------
// POST /book/:seatId?userId=xyz
// -----------------------------
app.post("/book/:seatId", (req, res) => {
  const seatId = req.params.seatId;
  const userId = req.query.userId;

  if (!userId) return res.status(400).json({ error: "Missing userId" });
  if (!seats[seatId]) return res.status(404).json({ error: "Seat not found" });

  expireLocks();
  let seat = seats[seatId];

  if (seat.status === "available") {
    return res.status(400).json({ error: "Seat must be locked before booking" });
  }

  if (seat.status === "locked" && seat.lockedBy !== userId) {
    return res.status(400).json({ error: "Seat locked by another user" });
  }

  if (seat.status === "locked" && seat.lockedBy === userId) {
    // Confirm booking
    seat.status = "booked";
    seat.lockedBy = null;
    seat.lockExpiresAt = null;
    return res.json({ message: Seat ${seatId} booked successfully! });
  }

  if (seat.status === "booked") {
    return res.status(400).json({ error: "Seat already booked" });
  }
});

// -----------------------------
app.listen(PORT, () => {
  console.log(Server running on http://localhost:${PORT});
});