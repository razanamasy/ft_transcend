import { createContext } from "react";
import io from 'socket.io-client';

				export const socketConnexion = io("http://" + process.env.REACT_APP_HOSTNAME42 + ":8000/connexion", {transports: ['websocket'], upgrade: false})
				export const socketPong = io("http://" + process.env.REACT_APP_HOSTNAME42 + ":8000/pong", {transports: ['websocket'], upgrade: false})
				export const socket = io("http://" + process.env.REACT_APP_HOSTNAME42 + ":8000/chat", {transports: ['websocket'], upgrade: false})
				export const SocketContext = createContext<any>({
					socket: {
						on: (name: string, callback: Function) => { },
						emit: (name: string, element: any ,callback: any = {}) => { },
					},
					socketPong: {
						on: (name: string, callback: Function) => { },
						emit: (name: string, element: any , callback: any = {}) => { },
					},
					socketConnexion: {
						on: (name: string, callback: Function) => { },
						emit: (name: string, element: any , callback: any = {}) => { },
					},
				});
				export default SocketContext;
