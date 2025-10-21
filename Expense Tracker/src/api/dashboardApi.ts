import axios from "axios";
import { API_BASE_URL } from "../services/apiClient";


export const getDashboardStats = async() =>{
const res = await  axios.get(`${API_BASE_URL}/stats`);
return res.data;
}
   








