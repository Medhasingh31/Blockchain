const { uploadToIPFS, getFromIPFS } = require('./ipfs-service');

async function testIPFS() {
  try {
    console.log('Testing IPFS upload...\n');

    const feedbackText = 'This is a test feedback for CS101 course. Great learning experience!';
    
    console.log('Uploading to IPFS via Pinata...');
    const ipfsHash = await uploadToIPFS(feedbackText, 'test-feedback.txt');
    
    console.log('✓ Upload successful!');
    console.log('IPFS Hash:', ipfsHash);
    console.log('IPFS URL:', `https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    console.log('');

    console.log('Retrieving from IPFS...');
    const content = await getFromIPFS(ipfsHash);
    console.log('✓ Retrieved content:', content);
    console.log('');

    console.log('=== IPFS test passed! ===');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testIPFS();
