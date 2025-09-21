import TodoList from '@/app/components/TodoList';

export default async function Home() {
  return (
    <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', gap: 20, padding: 20 }}>
      <TodoList list="VALLEY" />
      <TodoList list="TRADER" />
    </div>
  );
}
