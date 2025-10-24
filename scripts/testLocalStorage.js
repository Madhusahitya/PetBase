// Simple test to check localStorage in browser console
console.log('Testing localStorage...');

// Check if we can access localStorage
if (typeof localStorage !== 'undefined') {
  console.log('localStorage is available');
  
  // Check the specific key
  const stored = localStorage.getItem('petpals-created-pets');
  console.log('Raw stored data:', stored);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      console.log('Parsed pets:', parsed);
      console.log('Number of pets:', parsed.length);
    } catch (error) {
      console.error('Error parsing stored data:', error);
    }
  } else {
    console.log('No pets found in localStorage');
  }
} else {
  console.log('localStorage is not available');
}
