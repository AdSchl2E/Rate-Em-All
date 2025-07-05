// Test script pour vérifier l'API
const test = async () => {
  try {
    console.log('Testing batch API...');
    const response = await fetch('http://localhost:3002/api/pokemon?action=batch&ids=1,25,150');
    const data = await response.json();
    console.log('Batch API response:', data);
    
    console.log('\nTesting top-rated API...');
    const topRatedResponse = await fetch('http://localhost:3002/api/pokemon?action=top-rated&limit=3');
    const topRatedData = await topRatedResponse.json();
    console.log('Top-rated API response:', topRatedData);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

test();
