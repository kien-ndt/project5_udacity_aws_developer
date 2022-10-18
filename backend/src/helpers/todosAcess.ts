import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

const TODOS_TABLE = process.env.TODOS_TABLE;
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()

export const getTodos = async (userId: string): Promise<TodoItem[]> => {
    logger.info(`Get all todo items for user ${userId}`)
    const results = await docClient.query({
        TableName: TODOS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
    }).promise();
    return results.Items as TodoItem[];
}

export const createTodo = async(todoItem: TodoItem): Promise<TodoItem> => {
  logger.info(`Create a new todo item for user ${todoItem.userId}`)
  await docClient.put({
    TableName: TODOS_TABLE,
    Item: todoItem
  }).promise();
  return todoItem;
}

export const patchTodoAttachmentUrl = async (userId: string, todoId: string, attachmentUrl: string): Promise<void> => {
  logger.info(`Update todo item ${todoId}'s attachment url for user ${userId}`)
  await docClient.update({
    TableName: TODOS_TABLE,
    Key: { userId, todoId },
    ConditionExpression: 'attribute_exists(todoId)',
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': attachmentUrl
    }
  }).promise();
}

export const updateTodo = async (userId: string, todoId: string, todoItemUpdate: TodoUpdate): Promise<void> => {
  logger.info(`Update a todo item ${todoId} for user ${userId}`)
  await docClient.update({
    TableName: TODOS_TABLE,
    Key: { userId, todoId },
    ConditionExpression: 'attribute_exists(todoId)',
    UpdateExpression: 'set #todoName = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeNames: { '#todoName': 'name' },
    ExpressionAttributeValues: {
      ':name': todoItemUpdate.name,
      ':dueDate': todoItemUpdate.dueDate,
      ':done': todoItemUpdate.done
    }
  }).promise();
}

export const deleteTodo =async (userId: string, todoId: string): Promise<void> => {
  logger.info(`Delete todo item ${todoId} for user ${userId}`)
  await docClient.delete({
    TableName: TODOS_TABLE,
    Key: { userId, todoId }
  }).promise();
}