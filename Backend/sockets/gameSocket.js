module.exports = (io, socket) => {
  console.log("🔌 New socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
};
