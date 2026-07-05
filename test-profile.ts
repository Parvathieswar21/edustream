import fetch from 'node-fetch';

async function testProfile() {
  const baseUrl = 'http://localhost:3000/api';
  console.log('--- 1. Logging in as Teacher ---');
  let res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'TCH001', password: 'password123', role: 'teacher' })
  });
  let data: any = await res.json();
  const token = data.token;
  if (!token) throw new Error('Initial login failed! Response: ' + JSON.stringify(data));
  console.log('✅ Logged in successfully. Token received.');

  console.log('\n--- 2. Fetching Profile ---');
  res = await fetch(`${baseUrl}/teacher/profile`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testProfile().catch(console.error);
