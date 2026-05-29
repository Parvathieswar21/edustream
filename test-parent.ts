import { db } from './server/db.ts';
try {
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Test Parent', 'parent@test.com', '123', 'parent');
  console.log('SUCCESS');
} catch (e: any) {
  console.log('ERROR:', e.message);
}
