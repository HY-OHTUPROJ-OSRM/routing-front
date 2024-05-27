import axios from 'axios'
const baseUrl = 'http://127.0.0.1:3000/polygons'

const getPolygons = async () => {
  const request = axios.get(`${baseUrl}/all`)
  const response = await request
  return response.data
}

const UpdatePolygon= async (object) => {
  const request = axios.put(`${baseUrl}/${object.id}`)
  const response = await request
  return response.data
}

const CreatePolygon = async (object) => {
  try{
    const response = await axios({
      url: `${baseUrl}/new`, 
      method: "post",
      data: object,
      headers: {"content-type": "application/json"},
    })

    console.log(response.data)

    if (response.status === 201) {
      return response.data
    }
  } catch(error){
    if (error.response) {
      throw new Error(error.response.data.message)
    } else if (error.request) {
      throw new Error("Failed to connect to server")
    }
  }
}

const DeletePolygon = async (PolygonId) => {
  const response = await axios.delete(`${baseUrl}/${PolygonId}`)
  return response
}


export {getPolygons, CreatePolygon, DeletePolygon, UpdatePolygon}