import { CreatePolygon }  from "./PolygonService";

export const addPolygon = (formData) => {

    let newPolygon = {
      name: formData.name,
      type: formData.type,
      coordinates: formData.coordinates
    };
    console.log(newPolygon)
    CreatePolygon(newPolygon)
    // Access the data.json directly from the public folder
    
        // Write the updated data back to the JSON file
        // This part depends on how you want to handle writing data back to the file
        // It typically involves sending a request to a server-side endpoint that handles file writing
    };
 