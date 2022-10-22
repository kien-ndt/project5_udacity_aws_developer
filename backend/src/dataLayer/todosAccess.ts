import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { ITodosAccess } from './ITodosAccess'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

export class TodosAccess implements ITodosAccess {
  private logger
  private XAWS
  private docClient
  private readonly TODOS_TABLE = process.env.TODOS_TABLE

  constructor() {
    this.logger = createLogger('TodosAccess')
    this.XAWS = AWSXRay.captureAWS(AWS)
    this.docClient = new this.XAWS.DynamoDB.DocumentClient()
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    this.logger.info(`Get all todo items for user ${userId}`)
    const results = await this.docClient
      .scan({
        TableName: this.TODOS_TABLE
      })
      .promise()
    return results.Items as TodoItem[]
  }

  async getTodo(userId: string, todoId: string): Promise<TodoItem> {
    this.logger.info(`Get todo items for user ${userId}`)
    const results = await this.docClient
      .query({
        TableName: this.TODOS_TABLE,
        KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId,
          ':userId': userId
        }
      })
      .promise()
    return results.Items[0] as TodoItem
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    this.logger.info(`Create a new todo item for user ${todoItem.userId}`)
    await this.docClient
      .put({
        TableName: this.TODOS_TABLE,
        Item: todoItem
      })
      .promise()
    return todoItem
  }

  async patchTodoAttachmentUrl(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ): Promise<void> {
    this.logger.info(
      `Update todo item ${todoId}'s attachment url for user ${userId}`
    )
    await this.docClient
      .update({
        TableName: this.TODOS_TABLE,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
  }

  async updateTodo(
    userId: string,
    todoId: string,
    todoItemUpdate: TodoUpdate
  ): Promise<void> {
    this.logger.info(`Update a todo item ${todoId} for user ${userId}`)
    await this.docClient
      .update({
        TableName: this.TODOS_TABLE,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression:
          'set #todoName = :name, dueDate = :dueDate, likeCount = :likeCount',
        ExpressionAttributeNames: { '#todoName': 'name' },
        ExpressionAttributeValues: {
          ':name': todoItemUpdate.name,
          ':dueDate': todoItemUpdate.dueDate,
          ':likeCount': todoItemUpdate.likeCount
        }
      })
      .promise()
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    this.logger.info(`Delete todo item ${todoId} for user ${userId}`)
    await this.docClient
      .delete({
        TableName: this.TODOS_TABLE,
        Key: { userId, todoId }
      })
      .promise()
  }
}
