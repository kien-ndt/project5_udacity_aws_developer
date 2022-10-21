export interface TodoItem {
  userId: string
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  likeCount: number
  attachmentUrl?: string
  owner: boolean
}
