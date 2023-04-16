import { useAuth } from './hook/useAuth';
import { useState, useEffect } from 'react';
import useAxiosPrivate from './hook/useAxiosPrivate';
import './styles/generateQRCode.css'

//Bootstrap
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

export const  GenerateQRCode = () => {
	const { auth } = useAuth();
	let QRString: any;
	const [qrcode, setQRCode] = useState('');
	const [msg, setMsg] = useState('');
	const [validationCode, setValidationCode] = useState('');
	//const [refresh, setRefresh] = useState(false);
	const axiosPrivate = useAxiosPrivate();

	useEffect(() => {

	}, [qrcode, validationCode,auth.enable2FA])



	const handleGenerate = async () => {
		QRString = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/generate",
		);
		setQRCode(QRString.data);
	}



	const handleEnable = async (e: any) => {
		const controller = new AbortController();
		e.preventDefault();
		try {
			const	ret = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/2fa/turn-on" ,JSON.stringify({twoFactorAuthenticationCode : validationCode}),
			{
					signal: controller.signal,
			}
			)

			setMsg(ret.data.msg);
			if (ret.data.msg == 'Enable 2FA success')
			window.location.reload();
		}
		catch (e)
		{
		}
	}

	const handleDisable = async (e: any) => {
		e.preventDefault();
		try {
			const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/2fa/turn-off");
			setMsg(ret.data.msg);
			window.location.reload();
		} catch (e)
		{
		}
	}

	return (

		<section className="sectionSettings" >
			<br/>
			<Alert variant="primary">
				<Alert.Heading>How does it work</Alert.Heading>
				-	Make sure you have an active QR code :<br/>
				-	If you don't, re-generate one <br/>
				-	Scan it with your Google Authenticator app <br/>
				-	Enable 2F logging with your validation code (on Google Authenticator app) if you want to use it <br/>
				<br/>
				-	If you log again, enter your validation code (on Google Authenticator app)<br/>
				<br/>
				-	You can disable the 2FA at any moment <br/>
			</Alert>
			<Alert variant="warning">
				<Alert.Heading>WARNING</Alert.Heading>
				-	Please make sure you have disabled 2FA before deleting your code generator in the Google Authenticator application<br/>
				-	Otherwise you will loose access to your account here <br/>
			</Alert>

			<Button onClick={handleGenerate} >GENERATE QR CODE </Button>
			{
				qrcode
					?	<img className='barcode' src={qrcode} />
					: <div></div>
			}
			{
				<div>
					<br/>
					<br/>
					<br/>

					<div>
						{
							!auth.enable2FA ?
								<form>
									<label htmlFor="enableInput">

										<p>{msg ? msg : ''}</p>
										<p>Your 2FA is {auth.enable2FA ? "already enabled" : "disabled"}</p>
									</label>
									<input
										type="text"
										id="enableInput"
										autoComplete="off"
										required
										onChange={(e) => setValidationCode(e.target.value)}
										value={validationCode}
									/>
									<Button onClick={handleEnable} disabled={((validationCode.length == 6) && !auth.enable2FA ) ? false : true} >Enable 2FA</Button>
								</form>
								:
								<div>
									<p>{auth.enable2FA ? "Your 2FA already enabled" : ""}</p>
									<Button onClick={handleDisable} disabled={auth.enable2FA ? false : true}>Disable 2FA</Button>
								</div>
						}
					</div>
				</div>
			}
		</section>
	)
}
