import fetch from 'node-fetch';
import Database from 'better-sqlite3';

async function testPasswordChange() {
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

  console.log('\n--- 2. Changing Password ---');
  res = await fetch(`${baseUrl}/auth/change-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ oldPassword: 'password123', newPassword: 'newpassword123' })
  });
  data = await res.json();
  console.log('Change Password Response:', data);
  if (res.status !== 200) throw new Error('Password change failed!');
  console.log('✅ Password changed properly.');

  console.log('\n--- 3. Verifying Login with NEW Password ---');
  res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'TCH001', password: 'newpassword123', role: 'teacher' })
  });
  data = await res.json();
  if (!data.token) throw new Error('Login with new password failed! Response: ' + JSON.stringify(data));
  console.log('✅ Logged in successfully with NEW password.');

  console.log('\n--- 4. Changing Password BACK to original for future tests ---');
  const newToken = data.token;
  res = await fetch(`${baseUrl}/auth/change-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${newToken}` 
    },
    body: JSON.stringify({ oldPassword: 'newpassword123', newPassword: 'password123' })
  });
  data = await res.json();
  console.log('✅ Password reverted to original.');
  
  console.log('\n🎉 All tests passed!');
}

testPasswordChange().catch(console.error);
