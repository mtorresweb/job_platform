import type { Server as NetServer } from "http";
import type { Socket } from "net";
import { NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

export interface ServerWithIO extends NetServer {
  io?: IOServer;
}

export interface ResponseWithSocket extends NextApiResponse {
  socket: Socket & {
    server: ServerWithIO;
  };
}
