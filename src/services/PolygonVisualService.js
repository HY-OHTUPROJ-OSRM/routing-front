export const getColorAndOpacity =(type, val) =>{
    let color, opacity;
    // Determine color based on type and value
    switch (type) {
      case 'roadblock':
        color = 'darkred';
        opacity = 0.5; // Roadblock always returns opacity 0.5
        break;
      case 'cap':
        color = 'grey';
        opacity = Math.min(0.5, Math.max(0, Math.abs(val) / 100));  // Cap standardized between 0 to 100
        break;
      case 'constant':
        color = 'yellow';
        opacity = Math.min(0.5, Math.max(0, Math.abs(val) / 100)); // Constant standardized between 0 and 100
        break;
      case 'offset':
        color = val >= 0 ? 'green' : 'red';
        opacity = Math.min(0.5, Math.max(0, Math.abs(val) / 100)); // Offset standardized between 0 and 100
        break;
      case 'factor':
        color = val > 1 ? 'green' : 'red';
        opacity = Math.min(0.5, Math.max(0, Math.abs(val) / 10)); // Factor standardized between 0 and 100
        break;
      default:
        color = 'black';
        opacity = 0.5;
        break;
    }
    //Instead of scaling opacity, we can use a constant value
    const op=0.5
    return { color, op };
  }