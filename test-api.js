const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testAPI() {
  try {
    console.log('=== Testing StudentFeedback API ===\n');

    // 1. Submit feedback
    console.log('1. Submitting feedback...');
    const submitResponse = await axios.post(`${BASE_URL}/submit-feedback`, {
      feedbackText: 'This is a great course! I learned a lot about blockchain development.',
      courseId: 'CS101'
    });
    console.log('✓ Feedback submitted:', submitResponse.data);
    const feedbackId = submitResponse.data.feedbackId;
    console.log('');

    // 2. Get feedback by ID
    console.log('2. Getting feedback by ID...');
    const getResponse = await axios.get(`${BASE_URL}/feedback/${feedbackId}`);
    console.log('✓ Feedback retrieved:', getResponse.data);
    console.log('');

    // 3. Update status
    console.log('3. Updating feedback status...');
    const updateResponse = await axios.post(`${BASE_URL}/update-status`, {
      feedbackId: feedbackId,
      status: 'Approved'
    });
    console.log('✓ Status updated:', updateResponse.data);
    console.log('');

    // 4. Get updated feedback
    console.log('4. Getting updated feedback...');
    const updatedResponse = await axios.get(`${BASE_URL}/feedback/${feedbackId}`);
    console.log('✓ Updated feedback:', updatedResponse.data);
    console.log('');

    // 5. Get all feedback
    console.log('5. Getting all feedback...');
    const allResponse = await axios.get(`${BASE_URL}/feedback`);
    console.log('✓ All feedback:', allResponse.data);
    console.log('');

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI();
