import db from './server/db.ts';

try {
  console.log('Querying DB...');
  const user = db.prepare('SELECT id, name, username, email, role, phone, address, profile_image, email_verified, phone_verified FROM users WHERE role="teacher" LIMIT 1').get();
  console.log('User:', user);
} catch (error) {
  console.error('DB Error:', error);
}
