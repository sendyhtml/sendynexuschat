require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("./models/Message");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat Server is Running...");
});

io.on("connection", (socket) => {
    Message.find().then((messages) => {
      socket.emit("previousMessages", messages);
    });
  
    socket.on("sendMessage", async (data) => {
      const newMessage = new Message(data);
      await newMessage.save();
      io.emit("receiveMessage", data);
    });
  });
  
server.listen(process.env.PORT, () => {
  console.log("Server running on http://localhost:3000");
});
