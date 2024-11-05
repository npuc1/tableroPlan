export const processCSV = (csvContent) => {
  try {
    console.log('Starting CSV processing...');
    
    // detect and normalize line endings
    const normalizedContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Fparse CSV line
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          // escaped quote (double quote) check
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++; // skip the next quote
          } else {
            // toggle quote mode
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // end of field
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // last field
      result.push(current.trim());
      
      return result;
    };
    
    // split into lines and filter out empty
    let lines = normalizedContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log('Number of lines found:', lines.length);
    
    // process header for state names
    const stateNames = parseCSVLine(lines[0])
      .filter(name => name.length > 0);
    
    console.log('State names found:', stateNames);
    
    // initialize stateArray
    const stateArrayObject = {};
    stateNames.forEach(stateName => {
      if (stateName) {
        stateArrayObject[stateName] = {
          institutions: [],
          reporteListo: false,
          acuseEmitido: false
        };
      }
    });
    
    // process remaining lines as institutions
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      
      row.forEach((institution, index) => {
        if (institution && stateNames[index]) {
          stateArrayObject[stateNames[index]].institutions.push(institution);
        }
      });
    }
    
    console.log('Final processed stateArray object:', stateArrayObject);
    return stateArrayObject;
    
  } catch (error) {
    console.error('Detailed error in CSV processing:', error);
    console.error('Error occurred at:', error.stack);
    return {
      'default': {
        institutions: [],
        reporteListo: false,
        acuseEmitido: false
      }
    };
  }
};