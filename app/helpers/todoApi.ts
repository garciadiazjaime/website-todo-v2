import { Todo, ListType } from "@/app/types";

export const fetchTodos = async (list: ListType): Promise<Todo[]> => {
  const response = await fetch(`/api/todos?list=${list}`);
  return response.json();
};

export const addTodos = async (
  todos: { id: number; text: string; done: boolean; list: ListType }[]
): Promise<void> => {
  await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todos),
  });
};

export const deleteTodosList = async (list: ListType): Promise<void> => {
  await fetch(`/api/todos?list=${list}`, { method: "DELETE" });
};

export const updateTodo = async (
  id: number,
  updates: { done?: boolean; text?: string; category?: ListType }
): Promise<void> => {
  await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
};

export const deleteTodo = async (
  id: number,
  category?: ListType
): Promise<void> => {
  await fetch(`/api/todos/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  });
};
