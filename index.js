const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// In-memory storage
let users = [];
let exercises = [];

// Generate ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// ================= API ROUTES ================= //

// 1. Create user
app.post("/api/users", (req, res) => {
  const newUser = {
    username: req.body.username,
    _id: generateId(),
  };

  users.push(newUser);
  res.json(newUser);
});

// 2. Get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// 3. Add exercise (matches your HTML dynamic URL)
app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;

  const user = users.find((u) => u._id === req.params._id);
  if (!user) {
    return res.json({ error: "User not found" });
  }

  const parsedDuration = Number(duration);
  if (!description || isNaN(parsedDuration)) {
    return res.json({ error: "Invalid input" });
  }

  const parsedDate = date ? new Date(date) : new Date();

  const exercise = {
    userId: user._id,
    description,
    duration: parsedDuration,
    date: parsedDate,
  };

  exercises.push(exercise);

  res.json({
    username: user.username,
    description,
    duration: parsedDuration,
    date: parsedDate.toDateString(),
    _id: user._id,
  });
});

// 4. Get logs
app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query;

  const user = users.find((u) => u._id === req.params._id);
  if (!user) {
    return res.json({ error: "User not found" });
  }

  let userExercises = exercises.filter((e) => e.userId === user._id);

  if (from) {
    userExercises = userExercises.filter((e) => e.date >= new Date(from));
  }

  if (to) {
    userExercises = userExercises.filter((e) => e.date <= new Date(to));
  }

  if (limit) {
    userExercises = userExercises.slice(0, Number(limit));
  }

  const log = userExercises.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString(),
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log,
  });
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
