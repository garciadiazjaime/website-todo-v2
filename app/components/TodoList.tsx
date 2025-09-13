'use client';

import { useState } from 'react';

interface Todo {
    id: number;
    text: string;
    done: boolean;
}

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [textareaValue, setTextareaValue] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    const addTodos = () => {
        const newTodos = textareaValue
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line, index) => ({
                id: Date.now() + index,
                text: line.trim().replace(/-/g, '').toLocaleLowerCase(),
                done: false,
            }));
        setTodos((prev) => [...prev, ...newTodos]);
        setTextareaValue('');
    };

    const toggleDone = (id: number) => {
        setTodos((prev) => {
            const updatedTodos = prev.map((todo) =>
                todo.id === id ? { ...todo, done: !todo.done } : todo
            );
            return updatedTodos.sort((a, b) => Number(a.done) - Number(b.done)); // Sort by done status
        });
    };

    const editTodo = (id: number, newText: string) => {
        setTodos((prev) =>
            prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo))
        );
    };

    const deleteTodo = (id: number) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
    };

    const startEditing = (id: number) => {
        setEditingId(id);
    };

    const stopEditing = () => {
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevents a new line in the textarea
            addTodos();
        }
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            stopEditing(); // Exit edit mode on Enter or Esc key press
        }
    };

    return (
        <div className="todo-list" style={{ fontSize: '1.2rem' }}> {/* Increase font size */}
            <textarea
                name='todo-input'
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                onKeyDown={handleKeyDown} // Call addTodos on Enter key press
                placeholder="Enter todos, one per line and hit enter :)"

            />
            <ul style={{ padding: 0, listStyle: 'none' }}>
                {todos.map((todo) => (
                    <li
                        key={todo.id}
                        className={todo.done ? 'done' : ''}
                        onDoubleClick={() => startEditing(todo.id)} // Enable edit mode on double-click
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px',
                            gap: '10px',
                            backgroundColor: "white",
                            padding: "12px",
                            opacity: todo.done ? 0.6 : 1,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'space-between', width: '100%' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={() => toggleDone(todo.id)} style={{ background: 'none', cursor: 'pointer', width: 50, minHeight: 50, height: '100%', fontSize: 34 }}>
                                    {todo.done ? '✔️' : ''}
                                </button>
                                {editingId === todo.id ? (
                                    <input
                                        type="text"
                                        value={todo.text}
                                        onChange={(e) => editTodo(todo.id, e.target.value)}
                                        onKeyDown={(e) => handleEditKeyDown(e, todo.id)} // Exit edit mode on Enter or Esc key press
                                        onBlur={stopEditing}
                                        autoFocus
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    <div style={{ flex: 1, height: '100%', width: '100%', alignContent: 'center', fontSize: 40, textTransform: 'capitalize', wordBreak: 'break-word', textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</div>
                                )}
                            </div>

                            <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: '100%', width: '44px' }}>
                                🗑️ {/* Delete emoji */}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
