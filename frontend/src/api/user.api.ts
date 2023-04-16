import { UserI, UserCreationI, Code2FA } from './userI';
import axios from 'axios';



export class userApi {
		public static async login(credential: UserI) {
		const data = await axios.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/login/",
										JSON.stringify(credential),
										{
														withCredentials: true,
														headers: 
														{
																'Content-Type' : 'application/json'
														}
										});

		return (data);
	}

		public static async login2FA(credential: Code2FA) {
		const data = await axios.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/login/2FA",
										JSON.stringify(credential),
										{
														withCredentials: true,
														headers: 
														{
																'Content-Type' : 'application/json'
														}
										}
		);

		return (data);
	}


	public static async getRefreshToken() {
		const ret = await axios.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/refresh",
					{
								withCredentials: true,
								headers: 
								{
										'Content-Type' : 'application/json'
								}
					}

		);

				return (ret);
}

public static async logout() {
	const ret = await axios.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/logout",
				{
							withCredentials: true,
							headers: 
							{
									'Content-Type' : 'application/json'
							}
				}
	);
}

}
