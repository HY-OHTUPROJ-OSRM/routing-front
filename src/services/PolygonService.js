import ins from '../api/api';
import {convertToGeoJSON,convertToJSON} from './JSONToGeoJSON';
const getPolygons = async () => {
  try {
    const response = await ins({
      url: 'zones',
      method: "get",
      headers: { "content-type": "application/json" },
    });
    console.log(response);
    return convertToJSON(response.data);
  } catch (error) {
    handleAxiosError(error);
    return [];
  }
};

const UpdatePolygon = async (object) => {
  try {
    const response = await ins({
      url: `polygons/${object.name}`,
      method: "put",
      data: object,
      headers: { "content-type": "application/json" },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const CreatePolygon = async (object) => {
  console.log(object);
  try {
    const GEOJSON= convertToGeoJSON(object);
    console.log(GEOJSON)
    const response = await ins({
      url: 'zones',
      method: "post",
      data: GEOJSON,
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

const DeletePolygon = async (id) => {
  try {
    const response = await ins({
      url: `polygons/${id}`,
      method: "delete",
      headers: { "content-type": "application/json" },
    });
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
    console.log('no connection');
    throw new Error("Failed to connect to server");
  } else {
    throw new Error(error.message);
  }
};

export { getPolygons, CreatePolygon, DeletePolygon, UpdatePolygon };