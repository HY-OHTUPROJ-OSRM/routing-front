export const getColorAndOpacity =(type, val) =>{
    let color, opacity;
    console.log("val",val)
    // Determine color based on type and value
    switch (type) {
      case 'roadblock':
        color = 'darkred';
        opacity = 0.5; // Roadblock always returns opacity 0.5
        break;
      case 'cap':
        color = 'grey';
        opacity = Math.min(0.7, Math.max(0, (val - 1) / 9)); // Cap standardized between 1 to 10
        break;
      case 'constant':
        color = 'yellow';
        opacity = Math.min(0.7, Math.max(0, Math.abs(val) / 100)); // Constant standardized between 0 and 100
        break;
      case 'offset':
        color = val >= 0 ? 'green' : 'red';
        opacity = Math.min(0.7, Math.max(0, Math.abs(val) / 100)); // Offset standardized between 0 and 100
        break;
      case 'factor':
        color = val > 1 ? 'green' : 'red';
        opacity = Math.min(0.7, Math.max(0, Math.abs(val) / 100)); // Factor standardized between 0 and 100
        break;
      default:
        color = 'black';
        opacity = 0.5;
        break;
    }
    console.log(opacity, color)
    return { color, opacity };
  }