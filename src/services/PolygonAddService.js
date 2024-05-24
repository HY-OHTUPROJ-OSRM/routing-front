

export const addPolygon = (formData) => {

    let newPolygon = {
      name: formData.name,
      type: formData.type,
      coordinates: formData.coordinates
    };
    console.log(newPolygon)
    // Access the data.json directly from the public folder
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        // Push the new polygon to the existing data
        data.polygonlistobj.push(newPolygon);
    console.log(data)
        // Write the updated data back to the JSON file
        // This part depends on how you want to handle writing data back to the file
        // It typically involves sending a request to a server-side endpoint that handles file writing
      })
      .catch(error => console.error('Error adding polygon:', error));
  };
 