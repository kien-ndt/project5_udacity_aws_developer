import { createSignedUrl, getAttachmentUrl } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { ITodosAccess } from '../dataLayer/ITodosAccess'
import { TodosAccess } from '../dataLayer/TodosAccess'
import { ISendMessage } from '../dataLayer/ISendMessage'
import { SendMessage } from '../dataLayer/sendMessage'

// TODO: Implement businessLogic

const todoAccess: ITodosAccess = new TodosAccess()
const sendMessage: ISendMessage = new SendMessage()

export const getTodosForUser = async (userId?: string): Promise<TodoItem[]> => {
  let todoItemList = await todoAccess.getTodos(userId)
  if (!userId) {
    todoItemList = todoItemList.map((item) => {
      return { ...item, owner: false }
    })
  } else {
    todoItemList = todoItemList.map((item) => {
      return { ...item, owner: item.userId === userId }
    })
  }
  return todoItemList
}

export const createTodoForUser = async (
  userId: string,
  item: CreateTodoRequest
): Promise<TodoItem> => {
  return todoAccess.createTodo({
    ...item,
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    likeCount: 0,
    owner: true
  })
}

export const createAttachmentPresignedUrl = async (
  userId: string,
  todoId: string
): Promise<string> => {
  const uploadUrl = createSignedUrl(todoId)
  await todoAccess.patchTodoAttachmentUrl(
    userId,
    todoId,
    getAttachmentUrl(todoId)
  )
  return uploadUrl
}

export const updateTodoForUser = async (
  userId: string,
  todoId: string,
  item: UpdateTodoRequest
): Promise<void> => {
  console.log(todoId, ' this is to do idddd')
  const chooseItem: TodoItem = await todoAccess.getTodo(userId, todoId)
  todoAccess.updateTodo(userId, todoId, {
    ...item,
    likeCount: chooseItem.likeCount + 1
  })
  sendMessage.sendMessageToAllClient({
    todoId: todoId,
    likeCount: chooseItem.likeCount + 1
  })
  return
}

export const deleteTodoForUser = async (
  userId: string,
  todoId: string
): Promise<void> => {
  return todoAccess.deleteTodo(userId, todoId)
}
