const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoute");
const friendRoutes = require("./routes/friendRoute");
const messageRoutes = require('./routes/messageRoute');
const searchRoutes = require('./routes/searchRoute');
const friendSuggestionRoutes = require('./routes/friendSuggestionRoute');
const bodyParser = require("body-parser");
require("dotenv").config();


const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors({ credentials: true, origin: `http://localhost:3000` }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api", friendRoutes);
app.use("/api", messageRoutes);
app.use("/search", searchRoutes);
app.use("/api",friendSuggestionRoutes);



// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
