import { axiosInstance } from '../api/axios.instance';
import { useEffect } from 'react';
import { useAuth } from "./useAuth";
import { userApi } from "../api/user.api"
import { useNavigate } from "react-router-dom";

const useAxiosPrivate = () => {

		const { setAuth } = useAuth();
		const navigate = useNavigate();

		useEffect(() => {

				//No need to intercept the request ther's either the httpOnly cookie or not
	
				//Check if there is a 401 or 403 to refresh
				const responseIntercept = axiosInstance.interceptors.response.use(
							(response) => response,
							async (error) => {
									const prevRequest = error?.config;
									if ((error?.response?.status === 401 || error?.response?.status === 403) 
													&& !prevRequest?.sent)
									{

											prevRequest.sent = true;

											try {
													const userInfo = await userApi.getRefreshToken();


													setAuth({ nickname: userInfo.data.nickname,name: userInfo.data.name, enable2FA: userInfo.data.enable2FA, passLog: true});
											}
											catch (e)
											{

													setAuth({nickname: '', name: '', enable2FA: false, passLog: false });
													navigate("/Login");
													return ;
													
											}

											if (prevRequest.method == "post")
												return axiosInstance.post(prevRequest.url, prevRequest.data);
											else if (prevRequest.method == "get")
												return axiosInstance(prevRequest.url);
											else if (prevRequest.method == "put")
												return axiosInstance.put(prevRequest.url, prevRequest.data);
									}
									return Promise.reject(error);;
							}
				);

				return () => {
						axiosInstance.interceptors.response.eject(responseIntercept); // remove the interceptor response

				}
		},[])

		return axiosInstance;
}

export default useAxiosPrivate;
