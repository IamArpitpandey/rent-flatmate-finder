const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Interest = require('../models/Interest');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authenticate every socket connection using the same JWT used for REST
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie?.split('token=')[1]?.split(';')[0];
      if (!token) return next(new Error('Not authorized'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.user.name} (${socket.id})`);

    // Personal room for direct notifications
    socket.join(`user:${socket.user._id}`);

    socket.on('chat:join', async (interestId) => {
      const interest = await Interest.findById(interestId);
      if (!interest || interest.status !== 'accepted') return;
      const isParticipant =
        String(interest.tenant) === String(socket.user._id) ||
        String(interest.owner) === String(socket.user._id);
      if (!isParticipant) return;
      socket.join(`chat:${interestId}`);
    });

    socket.on('chat:message', async ({ interestId, text }) => {
      if (!text?.trim()) return;
      const interest = await Interest.findById(interestId);
      if (!interest || interest.status !== 'accepted') return;

      const isParticipant =
        String(interest.tenant) === String(socket.user._id) ||
        String(interest.owner) === String(socket.user._id);
      if (!isParticipant) return;

      const message = await Message.create({
        interest: interestId,
        sender: socket.user._id,
        text: text.trim(),
      });

      const populated = await message.populate('sender', 'name avatar');

      io.to(`chat:${interestId}`).emit('chat:message', populated);

      // Notify the other participant even if they aren't in the chat room
      const recipientId =
        String(interest.tenant) === String(socket.user._id) ? interest.owner : interest.tenant;

      await Notification.create({
        user: recipientId,
        type: 'new_message',
        title: `New message from ${socket.user.name}`,
        body: text.trim().slice(0, 100),
        relatedInterest: interestId,
      });

      io.to(`user:${recipientId}`).emit('notification:new', {
        type: 'new_message',
        title: `New message from ${socket.user.name}`,
      });
    });

    socket.on('chat:typing', ({ interestId, isTyping }) => {
      socket.to(`chat:${interestId}`).emit('chat:typing', {
        userId: socket.user._id,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.user.name}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO };
