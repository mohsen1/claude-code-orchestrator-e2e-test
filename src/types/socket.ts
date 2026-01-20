/**
 * Extended Socket.io types for the expense-sharing app
 */

import { Socket as BaseSocket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface ExtendedSocket extends BaseSocket {
  userId: string;
  userName: string;
  userEmail: string;
}

declare module 'socket.io' {
  interface Socket extends ExtendedSocket {}
}

declare module 'socket.io/dist/socket' {
  interface Socket extends ExtendedSocket {}
}

export interface SocketData {
  userId: string;
  userName: string;
  userEmail: string;
}
