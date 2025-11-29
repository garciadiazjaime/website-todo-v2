"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { Todo, ListType } from "@/app/types";

const overrideNetlifyEnvVars = {
  ...(process.env.MY_AWS_ACCESS_KEY_ID &&
    process.env.MY_AWS_SECRET_ACCESS_KEY && {
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
      },
    }),
};

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  ...overrideNetlifyEnvVars,
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "todos";

export async function fetchTodosFromDB(list: ListType): Promise<Todo[]> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: "#list = :list",
    ExpressionAttributeNames: {
      "#list": "list",
    },
    ExpressionAttributeValues: {
      ":list": list,
    },
  });

  const response = await docClient.send(command);
  const items = response.Items || [];

  // Sort by done status, then by id
  return items
    .map((item) => ({
      id: parseInt(item.id),
      text: item.text,
      done: item.done,
    }))
    .sort((a, b) => {
      if (a.done === b.done) {
        return a.id - b.id;
      }
      return a.done ? 1 : -1;
    });
}

export async function addTodosToDB(
  todos: { id: number; text: string; done: boolean; list: ListType }[]
) {
  const putPromises = todos.map((todo) => {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: todo.id.toString(), // DynamoDB hash key as string
        text: todo.text,
        done: todo.done,
        list: todo.list,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
    return docClient.send(command);
  });

  await Promise.all(putPromises);
}

export async function deleteTodosFromList(list: ListType) {
  // First, get all todos for the list
  const todos = await fetchTodosFromDB(list);

  // Delete each todo individually
  const deletePromises = todos.map((todo) => {
    return deleteTodoFromDB(todo.id);
  });

  await Promise.all(deletePromises);
}

export async function toggleTodoInDB(id: number, done: boolean) {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      id: id.toString(),
    },
    UpdateExpression: "SET done = :done, updated_at = :updated_at",
    ExpressionAttributeValues: {
      ":done": done,
      ":updated_at": new Date().toISOString(),
    },
  });

  await docClient.send(command);
}

export async function editTodoInDB(id: number, text: string) {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      id: id.toString(),
    },
    UpdateExpression: "SET #text = :text, updated_at = :updated_at",
    ExpressionAttributeNames: {
      "#text": "text",
    },
    ExpressionAttributeValues: {
      ":text": text,
      ":updated_at": new Date().toISOString(),
    },
  });

  await docClient.send(command);
}

export async function deleteTodoFromDB(id: number) {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      id: id.toString(),
    },
  });

  await docClient.send(command);
}
