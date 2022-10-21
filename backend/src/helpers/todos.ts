import { getTodos, createTodo, patchTodoAttachmentUrl, updateTodo, deleteTodo, getTodo, sendMessageToAllClient } from './todosAcess'
import { createSignedUrl, getAttachmentUrl } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic

export const getTodosForUser = async (userId?: string): Promise<TodoItem[]> => {    
  let todoItemList = await getTodos(userId);
  if (!userId) {
    todoItemList = todoItemList.map(item => {return {...item, owner: false}})
  }
  else {
    todoItemList = todoItemList.map(item => {return {...item, owner: item.userId === userId}})
  }
  return todoItemList;
}

export const createTodoForUser = async (userId: string, item: CreateTodoRequest): Promise<TodoItem> => {
  return createTodo({
    ...item,
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    likeCount: 0,
    owner: true
  });
}

export const createAttachmentPresignedUrl = async (userId: string, todoId: string): Promise<string>  => {
  const uploadUrl = createSignedUrl(todoId);
  await patchTodoAttachmentUrl(userId, todoId, getAttachmentUrl(todoId))
  return uploadUrl;
}

export const updateTodoForUser = async (userId: string, todoId: string, item: UpdateTodoRequest): Promise<void> => {
  console.log(todoId, " this is to do idddd")
  const chooseItem: TodoItem = await getTodo(userId, todoId);
  updateTodo(userId, todoId, {...item, likeCount: chooseItem.likeCount + 1});
  sendMessageToAllClient({todoId: todoId, likeCount: chooseItem.likeCount + 1})
  return
}

export const deleteTodoForUser = async (userId: string, todoId: string): Promise<void> => {
  return deleteTodo(userId, todoId);
}