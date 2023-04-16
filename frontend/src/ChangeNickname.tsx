
import { useAuth } from './hook/useAuth'
import { useState, useEffect } from 'react';
import useAxiosPrivate from './hook/useAxiosPrivate';
import './styles/modifyUser.css'

//Bootstrap
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export const ChangeNickname = () => {
	const NAME_REGEX = /^[a-zA-Z][a-zA-z0-9-_]{3,15}$/;
	const axiosPrivate = useAxiosPrivate();
	const {auth} = useAuth();
	//6) New name
	const [validName, setValidName] = useState(false);
	const [newName, setNewName] = useState('');
	const [errorName, setErrorName] = useState(false);

	useEffect(() =>
	{
		const result = NAME_REGEX.test(newName);
		setValidName(result);
	}, [newName])

	const updateName = async (e: any) =>
	{
		if (!validName)
		{
			window.alert("This nickname is invalid");
		}
		else
		{
			e.preventDefault();
			try {
				const	ret = await axiosPrivate.put("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/updateName" , {info:{name: auth.name, newName: newName}})
				if (ret.data.msg == 'error')
				{
					window.alert("User already exist");
				}
				else if (ret.data.msg == 'error1')
				{
					window.alert("Nickname can't start with a number");
				}
				else
				{
					auth.nickname = newName;
					window.alert("Nickname successfully changed");
				}
				setNewName('');
			} catch (e)
			{
			}
		}
	}

	return (
		<div>
			{
			<section className="sectionSettings">
				<Form className="nameForm" onSubmit={updateName}>
					<Form.Label htmlFor="OldPass">
						{
							errorName ?
								<div><br/> name already use</div>
							:
								<div>
									<br/>{auth.nickname} change your Nickname here !<br/>
									<i>
										- Length must be from 4 to 15 characters<br/>
										- Can't start with a number<br/>
										- Only letters, numbers and underscores ('_') allowed
									</i>
								</div>
						}
					</Form.Label>
					<Form.Control className="newNameControl"
						placeholder="new nickname"
						type=""
						id="newName"
						required
						onChange={(e) => setNewName(e.target.value)}
						value={newName}
					/>
					<Button
						className="mdp-button"
						variant="outline-primary"
						type="submit"
						disabled={ !newName || !validName }
					>Change name</Button>
				</Form>
			</section>
			}
		</div>
	);
}
