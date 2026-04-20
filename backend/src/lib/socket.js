import {Server} from "socket.io";

import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    },
});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
};

const userSocketMap = {}; // used to store online users {userId: socketId}

io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) {
        userSocketMap[userId] = socket.id; // store the mapping of userId to socketId
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // emit the list of online users to all clients

    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
        delete userSocketMap[userId]; // remove the user from the online users map on disconnect
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // emit the updated list of online users to all clients
        });

    
});        

export {io, server, app};