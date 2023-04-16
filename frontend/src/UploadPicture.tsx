import { useAuth } from './hook/useAuth'
import { useState } from 'react';
import './styles/modifyUser.css'

//Bootstrap
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import useAxiosPrivate from './hook/useAxiosPrivate';

export const UploadPicture = () => {

	const [avatar, setAvatar] = useState<Blob | null>(null);
	const [uploadMessage, setUploadMessage] = useState('');
	const controller = new AbortController();
	const axiosPrivate = useAxiosPrivate();
	const {auth} = useAuth();

	const uploadAvatar = async (event: any) =>
	{
		if (avatar == undefined)
			return ;
		event.preventDefault();
		const dataArray = new FormData();
		dataArray.append("avatar", avatar, auth.name + ".png");
		if (avatar.size >= 1000000)
		{
			setUploadMessage("File is too large.");
			return ;
		}
		try
		{
			const data = await axiosPrivate.post
			(
				"http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/setAvatar",
				dataArray,
				{
					signal: controller.signal,
					headers:
					{
						"Content-Type": "image/png"
					}
				}
			);
			if (data.data == "ok")
				setUploadMessage("Avatar successfully uploaded");
			else
				setUploadMessage("File is either too large or not a png.");
		} catch (e)
		{
			setUploadMessage("File is either too large or not a png.");
		}
	};

	return (
		<div>
			{
				<section className="sectionSettings">
					<br/>
					<h4>{auth.nickname}, update your avatar here</h4>
					<br/>
					<Alert variant="warning">
						<Alert.Heading>
							Upload avatar	
						</Alert.Heading>
						Image must be png and it's size must not exceed 1MB

					</Alert>
					<Form onSubmit={uploadAvatar}>
						<Form.Label>
							upload avatar
						</Form.Label>
						<Form.Control
							type="file"
							onChange={(e) =>
							{
								let	foo = (e.target as HTMLInputElement);
								if (!foo.files)
									return ;
								setAvatar(foo.files[0])
							}}
						/>
						{ uploadMessage ? <Alert variant="warning">{uploadMessage}</Alert> : <div></div> }
						<Button disabled={ !avatar } variant="outline-primary" type="submit">upload</Button>
					</Form>
				</section>
			}
		</div>
	);
}
