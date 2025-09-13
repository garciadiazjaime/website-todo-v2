'use client';

import { useState, useEffect } from 'react';
import { fetchTodosFromDB, addTodosToDB, toggleTodoInDB, editTodoInDB, deleteTodoFromDB } from '@/app/serverActions/todoActions'; // Import server actions

interface Todo {
    id: number;
    text: string;
    done: boolean;
}

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [textareaValue, setTextareaValue] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true); // Loading state
    const [resetTriggered, setResetTriggered] = useState(false); // Track if reset was triggered

    // Fetch todos from the database when the component mounts
    useEffect(() => {
        const fetchTodos = async () => {
            setLoading(true); // Show loading spinner
            const fetchedTodos = await fetchTodosFromDB(); // Fetch todos from the database
            setTodos(fetchedTodos);
            setLoading(false); // Hide loading spinner
        };

        fetchTodos();
    }, []);

    const addTodos = async () => {
        const newTodos = textareaValue
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line, index) => ({
                id: Date.now() + index,
                text: line.trim().replace(/-/g, '').toLocaleLowerCase(),
                done: false,
            }));

        if (resetTriggered) {
            // Remove existing todos only if reset was triggered
            await Promise.all(todos.map((todo) => deleteTodoFromDB(todo.id)));
        }

        setTodos(newTodos);
        setTextareaValue('');
        setResetTriggered(false); // Reset the flag after adding todos

        // Call server action to save new todos
        await addTodosToDB(newTodos);
    };

    const toggleDone = async (id: number) => {
        setTodos((prev) => {
            const updatedTodos = prev.map((todo) =>
                todo.id === id ? { ...todo, done: !todo.done } : todo
            );
            return updatedTodos.sort((a, b) => Number(a.done) - Number(b.done));
        });

        // Call server action
        await toggleTodoInDB(id, !todos.find((todo) => todo.id === id)?.done);
    };

    const editTodo = async (id: number, newText: string) => {
        setTodos((prev) =>
            prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo))
        );

        // Call server action
        await editTodoInDB(id, newText);
    };

    const deleteTodo = async (id: number) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));

        // Call server action
        await deleteTodoFromDB(id);
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

    const resetTodos = () => {
        // Move all todos into the textarea, one per line
        const todosText = todos.map((todo) => todo.text).join('\n');
        setTextareaValue(todosText);
        setResetTriggered(true); // Set the flag to indicate reset was triggered
    };

    return (
        <div className="todo-list" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            {loading ? ( // Show loading spinner while fetching todos
                <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#555' }}>Loading...</div>
            ) : (
                <>
                    <textarea
                        name='todo-input'
                        value={textareaValue}
                        onChange={(e) => setTextareaValue(e.target.value)}
                        onKeyDown={handleKeyDown} // Call addTodos on Enter key press
                        placeholder="Enter todos, one per line, and hit Enter :)"
                        style={{
                            width: '100%',
                            height: '100px',
                            padding: '10px',
                            fontSize: '1rem',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            marginBottom: '10px',
                            resize: 'none',
                        }}
                    />
                    <button
                        onClick={resetTodos}
                        className="reset-button"
                        style={{
                            margin: '0 0 24px',
                            padding: '10px',
                            fontSize: '1rem',
                            width: '100%',
                            backgroundColor: '#007BFF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Reset
                    </button>
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
                                    backgroundColor: todo.done ? '#f8f9fa' : '#ffffff',
                                    padding: '12px',
                                    borderRadius: '5px',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    opacity: todo.done ? 0.7 : 1,
                                    transition: 'background-color 0.3s, opacity 0.3s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <button
                                        onClick={() => toggleDone(todo.id)}
                                        style={{
                                            background: todo.done ? '#28a745' : 'none',
                                            color: todo.done ? 'white' : 'black',
                                            cursor: 'pointer',
                                            width: '40px',
                                            height: '40px',
                                            fontSize: '1.2rem',
                                            border: '1px solid #ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '10px',
                                            borderRadius: '5px',
                                        }}
                                    >
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
                                            style={{
                                                flex: 1,
                                                fontSize: '1rem',
                                                padding: '5px',
                                                border: '1px solid #ccc',
                                                borderRadius: '5px',
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                flex: 1,
                                                fontSize: '1.2rem',
                                                textTransform: 'capitalize',
                                                wordBreak: 'break-word',
                                                textDecoration: todo.done ? 'line-through' : 'none',
                                                color: todo.done ? '#6c757d' : '#212529',
                                            }}
                                        >
                                            {todo.text}
                                        </div>
                                    )}
                                </div>

                                {!todo.done ? (
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#dc3545',
                                            fontSize: '1.2rem',
                                        }}
                                    >
                                        🗑️
                                    </button>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
