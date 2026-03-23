require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanup() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // Show all categories
  console.log('=== Current Categories ===');
  const [all] = await conn.query('SELECT id, user_id, name, type FROM categories ORDER BY user_id, name, id');
  all.forEach(c => console.log(`  ID ${c.id} | User ${c.user_id} | ${c.name} (${c.type})`));

  console.log('\n=== Finding Duplicates ===');

  // Find duplicates - keep smallest ID for each (user_id, name) pair
  const [duplicates] = await conn.query(`
    SELECT c1.id, c1.user_id, c1.name
    FROM categories c1
    WHERE c1.id NOT IN (
      SELECT MIN(c2.id)
      FROM categories c2
      GROUP BY c2.user_id, c2.name
    )
  `);

  if (duplicates.length === 0) {
    console.log('  No duplicates found!');
  } else {
    console.log(`  Found ${duplicates.length} duplicates to delete:`);
    duplicates.forEach(c => console.log(`    - ID ${c.id} | User ${c.user_id} | ${c.name}`));

    // Delete duplicates
    const idsToDelete = duplicates.map(d => d.id);
    await conn.query('DELETE FROM categories WHERE id IN (?)', [idsToDelete]);
    console.log(`\n  Deleted ${duplicates.length} duplicate categories.`);
  }

  // Show remaining categories
  console.log('\n=== Categories After Cleanup ===');
  const [remaining] = await conn.query('SELECT id, user_id, name, type FROM categories ORDER BY user_id, type, name');
  remaining.forEach(c => console.log(`  ID ${c.id} | User ${c.user_id} | ${c.name} (${c.type})`));

  console.log(`\nTotal: ${remaining.length} categories`);

  await conn.end();
}

cleanup().catch(console.error);
