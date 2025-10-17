import axios from "axios";

const API_BASE = "http://localhost:4000/api/dashboard";

export const getDashboardStats = async() =>{
const res = await  axios.get(`${API_BASE}/stats`);
return res.data;
}
   








