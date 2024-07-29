const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let users = [];
let exercises = [];

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const _id = uuidv4();

  const newUser = { username, _id };
  users.push(newUser);

  res.json(newUser);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find((u) => u._id === _id);

  if (!user) {
    return res.json({ error: "User not found" });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  const newExercise = {
    _id: uuidv4(),
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
  };

  exercises.push({ ...newExercise, userId: _id });

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id,
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.find((u) => u._id === _id);

  if (!user) {
    return res.json({ error: "User not found" });
  }

  let userExercises = exercises.filter((e) => e.userId === _id);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter((e) => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter((e) => new Date(e.date) <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map((e) => ({
      description: e.description,
      duration: e.duration,
      date: e.date,
    })),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
