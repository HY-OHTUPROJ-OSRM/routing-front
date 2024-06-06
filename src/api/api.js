import axios from 'axios';

const ins = axios.create({
  baseURL: process.env.REACT_APP_ROUTING_API_URL || 'https://routing-api-ohtuprojekti-staging.apps.ocp-test-0.k8s.it.helsinki.fi/'
});

export default ins;