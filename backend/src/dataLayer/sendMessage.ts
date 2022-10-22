import { ISendMessage } from './ISendMessage'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

export class SendMessage implements ISendMessage {
  private readonly connectionsTable = process.env.CONNECTIONS_TABLE
  private readonly stage = process.env.STAGE
  private readonly apiId = process.env.API_ID
  private XAWS
  private docClient
  private apiGateway

  private readonly connectionParams = {
    apiVersion: '2018-11-29',
    endpoint: `${this.apiId}.execute-api.us-east-1.amazonaws.com/${this.stage}`
  }

  constructor() {
    this.XAWS = AWSXRay.captureAWS(AWS)
    this.docClient = new this.XAWS.DynamoDB.DocumentClient()
    this.apiGateway = new AWS.ApiGatewayManagementApi(this.connectionParams)
  }

  async sendMessageToAllClient(payload) {
    const connections = await this.docClient
      .scan({
        TableName: this.connectionsTable
      })
      .promise()
    for (const connection of connections.Items) {
      const connectionId = connection.id
      await this.sendMessageToClient(connectionId, payload)
    }
  }

  async sendMessageToClient(connectionId, payload) {
    try {
      console.log('Sending message to a connection', connectionId)

      await this.apiGateway
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify(payload)
        })
        .promise()
    } catch (e) {
      console.log('Failed to send message', JSON.stringify(e))
      if (e.statusCode === 410) {
        console.log('Stale connection')

        await this.docClient
          .delete({
            TableName: this.connectionsTable,
            Key: {
              id: connectionId
            }
          })
          .promise()
      }
    }
  }
}
