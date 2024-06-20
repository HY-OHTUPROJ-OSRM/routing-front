import axios from 'axios';
import { ROUTING_API_URL } from '../Utils/config';

// Create an axios instance with baseurl to be used in the app
export const ins = axios.create({
  baseURL: ROUTING_API_URL
});                                             
