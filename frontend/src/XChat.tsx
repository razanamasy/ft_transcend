import { useAuth } from './hook/useAuth';
import { useSocket } from './hook/useSocket';
import * as React from 'react';

import { Bar } from './XBar';
import {ChooseChat} from './ChooseChat';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export function XChat() {

		const {auth} = useAuth();
		const {socket} = useSocket();

		const theme = createTheme({
			palette: {
			  primary: {
				light: '#57975b',
				main: '#2e7d32',
				dark: '#205723',
				contrastText: '#fff',
			  },
			  secondary: {
				light: '#3f50b5',
				main: '#3f50b5',
				dark: '#3f50b5',
				contrastText: '#fff',
			  },
			  error :
			  {
				light: '#db5858',
				main: '#d32f2f',
				dark: '#932020',
				contrastText: '#fff',
			  },
			  warning :
			  {
				light: '#ff9800',
				main: '#ed6c02',
				dark: '#e65100',
				contrastText: '#fff',
			  },
			  mode: 'dark'
			},
		  });

		const darkTheme = createTheme({
			palette: {
			  mode: 'dark',
			},
		});

		if (socket)
				return (
						<div>
								<ThemeProvider theme={theme}>
								<CssBaseline />
								<Bar socket={socket}/>
								<ChooseChat socket={socket} login={auth.name}/>

								</ThemeProvider>
						</div>
				);

		return(<div></div>)
}
