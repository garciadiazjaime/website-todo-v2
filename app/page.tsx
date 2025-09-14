import TodoList from '@/app/components/TodoList';
import { fetchTodosFromDB } from '@/app/serverActions/todoActions';

export default async function Home() {
  const todos = await fetchTodosFromDB();

  return (
    <div className="container">
      <TodoList initialTodos={todos} />
    </div>
  );
}
