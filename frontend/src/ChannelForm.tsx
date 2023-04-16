import {Container, IconButton, TextField, Button, Divider, FormControl} from "@mui/material"
import { Fragment, useState, useRef} from 'react';
import { useAuth } from './hook/useAuth';
import { useSocket } from './hook/useSocket';
import useAxiosPrivate from './hook/useAxiosPrivate';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Snackbar from '@mui/material/Snackbar';
import Typography from "@mui/material";

import * as React from 'react';
//import { socket } from './context/Socket';

import { ListInvited } from "./Listinvited";


export function ChannelForm({listusers, closecform} : {listusers : {name : string, status : number, nickname : string}[], closecform : () => void})
{

	const [checked, setcheked] = useState<boolean>(false);
	const [showPassword, setshoPassWord] = useState<boolean>(false)
	const [password, setpassword] = useState<string>("")
	const [name, setname] = useState<string>("")
	const [ispublic, setispublic] = useState<string>("public")
	const [invitelist, setinvitelist] = useState<string[]>([]);
	const [opens, setopens] = useState<boolean>(false);
	const msg = useRef('default');

	const axiosPrivate = useAxiosPrivate();
	const {auth} = useAuth();
	const {socket} = useSocket();

	const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}
		setopens(false);
	}

	const clickShowPassword = () => {
		setshoPassWord(!showPassword);
	};

	const mouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	const publicToPrivate = (e : any) =>
	{
		setispublic((e.target as HTMLInputElement).value);
	}

	const managesendcformerror = (err : string) =>
	{
		if (err == 'existing')
		{
			msg.current = 'This channel already exist';
			setopens(true);
		}
		else if (err == 'no name')
		{
			msg.current = 'You should name your channel';
			setopens(true);
		}
		else if (err == 'large')
		{
			msg.current = 'This channel name is too large';
			setopens(true);
		}
		else
		{
			closecform();
		}
	}

	const sendcform = async (e: any) =>
	{
		e.preventDefault();

		if (name == "" || name == undefined)
		{
			return ("no name");
		}

		if (name.length >= 60)
		{
			return ("large");
		}


			const ret = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/addchan" ,JSON.stringify({data: {owner : auth.name, pass : password, name : name, ispublic : ispublic, invitelist : invitelist}}))
			return (ret.data.msg);
		
	}

	return (
		<Fragment>
			<Snackbar open={opens} autoHideDuration={3000}  anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={handleClose} message={msg.current}></Snackbar>
			<Container>
				<DialogTitle>NEW CHANNEL</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Please enter your channel caracteristics, it can be either
						public private or protected by a password.

					</DialogContentText>

					<form onSubmit={(e) => {sendcform(e).then((ret : string) => {managesendcformerror(ret); socket.emit('refreshchan', {room : auth.name + 'Chat'})})}}>
						<FormControl >
							<RadioGroup defaultValue="public" row aria-labelledby="demo-row-radio-buttons-group-label" name="row-radio-buttons-group" value={ispublic} onChange={publicToPrivate}>
								<FormControlLabel value="public" control={<Radio />} label="Public" />
								<FormControlLabel value="private" control={<Radio />} label="Private" />
							</RadioGroup>
						</FormControl>
						<TextField
							autoFocus
							id="name"
							label="Channel name"
							type="text"
							fullWidth
							variant="standard"
							onChange={(e : any) => setname(e.target.value)}
						/>
						<FormGroup>
							<FormControlLabel
								control={
									<Checkbox
										checked={checked}
										onChange={(e : any) => {setcheked(e.target.checked)}}
									/>
								}
								label="Protected ?"
							/>
						</FormGroup>
						{
							checked ?
								<Fragment>
									<FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
										<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
										<OutlinedInput
											id="outlined-adornment-password"
											type={showPassword ? 'text' : 'password'}
											value={password}
											onChange={(e : any) => {setpassword(e.target.value)}}
											endAdornment={
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle password visibility"
														onClick={clickShowPassword}
														onMouseDown={mouseDownPassword}
														edge="end"
													>
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											}
											label="Password"
										/>
									</FormControl>
								</Fragment>
							: null
						}
						{
							ispublic == 'private' ?
								<ListInvited
									listusers={listusers}
									setinvitelist={setinvitelist}
									invitelist={invitelist}
								/>
							: null
						}
					</form>
				</DialogContent>
				<DialogActions>
					<Button onClick={closecform}>Cancel</Button>
					<Button onClick={(e : any) => {sendcform(e).then((ret : string) => {managesendcformerror(ret); socket.emit('refreshchan', {room : auth.name + 'Chat'})})}}> Ok </Button>
				</DialogActions>
			</Container>
		</Fragment>
	);
}
