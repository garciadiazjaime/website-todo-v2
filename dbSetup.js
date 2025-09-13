const mysql = require("mysql2/promise");

require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function createTodosTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS todos (
        id BIGINT PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        done BOOLEAN NOT NULL DEFAULT false
      );
    `;

    await db.query(query);
    console.log("Table 'todos' ensured to exist.");
  } catch (error) {
    console.error("Error creating 'todos' table:", error);
  } finally {
    await db.end();
  }
}

createTodosTable();
