import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";

export interface ITodosAccess {
    getTodos: (userId: string) => Promise<TodoItem[]>
    getTodo: (userId: string, todoId: string) => Promise<TodoItem> 
    createTodo: (todoItem: TodoItem) => Promise<TodoItem>
    patchTodoAttachmentUrl: (userId: string, todoId: string, attachmentUrl: string) => Promise<void>
    updateTodo: (userId: string, todoId: string, todoItemUpdate: TodoUpdate) => Promise<void>
    deleteTodo: (userId: string, todoId: string) => Promise<void>
}