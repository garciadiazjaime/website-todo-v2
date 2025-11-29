"use server";

import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

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

const dynamoClient = new DynamoDBClient({
  region: "us-east-1",
  ...overrideNetlifyEnvVars,
});

const TABLE_NAME = "todos";

export async function fetchTodosFromDB(list: ListType): Promise<Todo[]> {
  console.log(`Fetching todos from DB for list`, list);
  try {
    // Use Scan instead of Query since we're filtering by a non-key attribute
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": { S: list },
      },
    });

    const response = await dynamoClient.send(command);
    const items = response.Items || [];

    // Sort by done status, then by id
    return items
      .map((item) => ({
        id: parseInt(item.id?.S || "0"),
        text: item.text?.S || "",
        done: item.done?.BOOL || false,
        list: item.category?.S as ListType,
      }))
      .sort((a, b) => {
        if (a.done === b.done) {
          return a.id - b.id;
        }
        return a.done ? 1 : -1;
      });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function addTodosToDB(
  todos: { id: number; text: string; done: boolean; list: ListType }[]
) {
  const putPromises = todos.map((todo) => {
    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: { S: todo.id.toString() }, // DynamoDB format
        text: { S: todo.text },
        done: { BOOL: todo.done },
        category: { S: todo.list },
        created_at: { S: new Date().toISOString() },
        updated_at: { S: new Date().toISOString() },
      },
    });
    return dynamoClient.send(command); // Use dynamoClient instead of docClient
  });

  await Promise.all(putPromises);
}

export async function deleteTodosFromList(list: ListType) {
  // First, get all todos for the list
  const todos = await fetchTodosFromDB(list);

  // Delete each todo individually
  const deletePromises = todos.map((todo) => {
    return deleteTodoFromDB(todo.id, todo.list);
  });

  await Promise.all(deletePromises);
}

export async function toggleTodoInDB(
  id: number,
  done: boolean,
  category: ListType = "DEFAULT"
) {
  const command = new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: {
      id: { S: id.toString() },
      category: { S: category },
    },
    UpdateExpression: "SET done = :done, updated_at = :updated_at",
    ExpressionAttributeValues: {
      ":done": { BOOL: done },
      ":updated_at": { S: new Date().toISOString() },
    },
  });

  await dynamoClient.send(command);
}

export async function editTodoInDB(
  id: number,
  text: string,
  category: ListType = "DEFAULT"
) {
  const command = new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: {
      id: { S: id.toString() },
      category: { S: category },
    },
    UpdateExpression: "SET #text = :text, updated_at = :updated_at",
    ExpressionAttributeNames: {
      "#text": "text",
    },
    ExpressionAttributeValues: {
      ":text": { S: text },
      ":updated_at": { S: new Date().toISOString() },
    },
  });

  await dynamoClient.send(command);
}

export async function deleteTodoFromDB(
  id: number,
  category: ListType = "DEFAULT"
) {
  const command = new DeleteItemCommand({
    TableName: TABLE_NAME,
    Key: {
      id: { S: id.toString() },
      category: { S: category },
    },
  });

  await dynamoClient.send(command);
}
