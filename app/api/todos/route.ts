import { NextRequest, NextResponse } from "next/server";
import {
  fetchTodosFromDB,
  addTodosToDB,
  deleteTodosFromList,
} from "@/app/serverActions/todoActions";
import { ListType } from "@/app/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const list = searchParams.get("list") as ListType;

  if (!list) {
    return NextResponse.json(
      { error: "List parameter is required" },
      { status: 400 }
    );
  }

  try {
    const todos = await fetchTodosFromDB(list);
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const todos = await request.json();
    await addTodosToDB(todos);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add todos" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const list = searchParams.get("list") as ListType;

  if (!list) {
    return NextResponse.json(
      { error: "List parameter is required" },
      { status: 400 }
    );
  }

  try {
    await deleteTodosFromList(list);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete todos" },
      { status: 500 }
    );
  }
}
