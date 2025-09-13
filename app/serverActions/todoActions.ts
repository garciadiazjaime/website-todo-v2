"use server";

import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.TF_VAR_mysql_host,
  user: process.env.TF_VAR_mysql_user,
  password: process.env.TF_VAR_mysql_pwd,
  database: process.env.TF_VAR_mysql_database,
});

export async function addTodosToDB(
  todos: { id: number; text: string; done: boolean }[]
) {
  const values = todos.map((todo) => [todo.id, todo.text, todo.done]);
  await db.query("INSERT INTO todos (id, text, done) VALUES ?", [values]);
}

export async function toggleTodoInDB(id: number, done: boolean) {
  await db.query("UPDATE todos SET done = ? WHERE id = ?", [done, id]);
}

export async function editTodoInDB(id: number, text: string) {
  await db.query("UPDATE todos SET text = ? WHERE id = ?", [text, id]);
}

export async function deleteTodoFromDB(id: number) {
  await db.query("DELETE FROM todos WHERE id = ?", [id]);
}
