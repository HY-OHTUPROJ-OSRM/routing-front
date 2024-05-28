import axios from 'axios';
//import TimedAlert from '../components/TimedAlert';
//import { useState } from 'react';
const baseUrl = 'http://127.0.0.1:3000/polygons';
const getPolygons = async () => {
  try {
    const request = axios.get(`${baseUrl}/all`);
    const response = await request;
    console.log(response)
    
    return response.data;
  } catch (error) {
    
    return []
  }
};

const UpdatePolygon = async (object) => {
  try {
    const request = axios.put(`${baseUrl}/${object.id}`, object);
    const response = await request;
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const CreatePolygon = async (object) => {
  console.log(object)
  try {
    const response = await axios({
      url: `${baseUrl}/new`,
      method: "post",
      data: object,
      headers: { "content-type": "application/json" },
    });

    console.log(response.data);

    if (response.status === 201) {
      return response.data;
    }
  } catch (error) {
    handleAxiosError(error);
  }
};

const DeletePolygon = async (PolygonId) => {
  try {
    const response = await axios.delete(`${baseUrl}/${PolygonId}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Helper function to handle errors
const handleAxiosError = (error) => {
  if (error.response) {
    throw new Error(error.response.data.message);
  } else if (error.request) {
    throw new Error("Failed to connect to server");
  } else {
    throw new Error(error.message);
  }
};

export { getPolygons, CreatePolygon, DeletePolygon, UpdatePolygon };