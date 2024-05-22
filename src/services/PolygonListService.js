const fetchPolygons = async () => {
    try {
      const response = await fetch("data.json"); // Assuming data.json is in the public folder
      const data = await response.json();
      return data.polygonlistobj;
    } catch (error) {
      console.error("Error fetching polygons:", error);
      return [];
    }
  };
  
  export default fetchPolygons;