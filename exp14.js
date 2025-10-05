const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

console.log("🔄 Starting Student Management System...");

// =============================
// MongoDB Connection
// =============================
const MONGODB_URI = "mongodb://localhost:27017/studentdb";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err.message);
  });

// =============================
// Student Schema and Model
// =============================
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2 },
  age: { type: Number, required: true, min: 16, max: 100 },
  course: { 
    type: String, required: true,
    enum: ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Business Administration", "Civil Engineering", "Medical Science"]
  }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

// =============================
// Sample Students Data
// =============================
const sampleStudents = [
  { _id: "686f66da1801707c14d09e60", name: "Alice Johnson", age: 20, course: "Computer Science" },
  { _id: "686f66da1801707c14d09e61", name: "Bob Smith", age: 22, course: "Mechanical Engineering" },
  { _id: "686f66da1801707c14d09e62", name: "Charlie Lee", age: 19, course: "Business Administration" }
];

// =============================
// CRUD Routes for Students
// =============================

// GET ALL STUDENTS
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.json(sampleStudents);
  }
});

// GET SINGLE STUDENT BY ID
app.get("/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: "Invalid student ID" });
  }
});

// CREATE NEW STUDENT
app.post("/students", async (req, res) => {
  try {
    const { name, age, course } = req.body;
    if (!name || name.length < 2) return res.status(400).json({ error: "Name is required and must be at least 2 characters" });
    if (!age || age < 16 || age > 100) return res.status(400).json({ error: "Age is required and must be between 16 and 100" });
    if (!course) return res.status(400).json({ error: "Course is required" });

    const student = new Student({ name, age: Number(age), course });
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE STUDENT
app.put("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE STUDENT
app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// Root Route
// =============================
app.get("/", async (req, res) => {
  let students;
  try {
    students = await Student.find();
    if (students.length === 0) students = sampleStudents;
  } catch (err) {
    students = sampleStudents;
  }

  res.json({
    message: "🚀 Student Management System is running!",
    status: "Server is active",
    database: mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌",
    totalStudents: students.length,
    students: students,
    endpoints: {
      "GET /": "API info with students (this page)",
      "GET /students": "Get all students",
      "GET /students/:id": "Get single student",
      "POST /students": "Create new student",
      "PUT /students/:id": "Update student",
      "DELETE /students/:id": "Delete student"
    },
    examplePayload: {
      createStudent: { name: "Student Name", age: 20, course: "Computer Science" }
    }
  });
});

// =============================
// Start Server
// =============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ STUDENT MANAGEMENT SYSTEM STARTED on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Student endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/students`);
  console.log(`   POST http://localhost:${PORT}/students`);
  console.log(`   PUT  http://localhost:${PORT}/students/:id`);
  console.log(`   DELETE http://localhost:${PORT}/students/:id`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`🔄 Port ${PORT} is busy, trying 3001...`);
    app.listen(3001, () => {
      console.log(`✅ SERVER STARTED on port 3001`);
      console.log(`🚀 Go to http://localhost:3001`);
    });
  }
});
