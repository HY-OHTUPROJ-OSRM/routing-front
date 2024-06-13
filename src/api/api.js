import axios from 'axios';

// Create an axios instance with baseurl to be used in the app
const ins = axios.create({
  baseURL: process.env.REACT_APP_ROUTING_API_URL || 'https://routing-api-ohtuprojekti-staging.apps.ocp-test-0.k8s.it.helsinki.fi/'
});                                                //https://routing-api-ohtuprojekti-staging.apps.ocp-test-0.k8s.it.helsinki.fi/                                                  

export default ins;