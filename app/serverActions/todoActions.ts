"use server";

import mysql from "mysql2/promise";

import { Todo, ListType } from "@/app/types";

const db = mysql.createPool({
  host: process.env.TF_VAR_mysql_host,
  user: process.env.TF_VAR_mysql_user,
  password: process.env.TF_VAR_mysql_pwd,
  database: process.env.TF_VAR_mysql_database,
});

export async function fetchTodosFromDB(list: ListType): Promise<Todo[]> {
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT id, text, done 
      FROM todos 
      WHERE list = ?
      ORDER BY done ASC, id ASC
    `,
    [list]
  );
  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    done: row.done === 1,
  }));
}

export async function addTodosToDB(
  todos: { id: number; text: string; done: boolean; list: ListType }[]
) {
  const values = todos.map((todo) => [
    todo.id,
    todo.text,
    todo.done,
    todo.list,
  ]);
  await db.query(
    `
    INSERT INTO todos (id, text, done, list) VALUES ?
  `,
    [values]
  );
}

export async function deleteTodosFromList(list: ListType) {
  await db.query(`DELETE FROM todos WHERE list = '${list}'`);
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
