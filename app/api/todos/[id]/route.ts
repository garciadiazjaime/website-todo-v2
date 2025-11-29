import { NextRequest, NextResponse } from "next/server";
import {
  toggleTodoInDB,
  editTodoInDB,
  deleteTodoFromDB,
} from "@/app/serverActions/todoActions";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const params = await context.params;
    const id = parseInt(params.id);

    if (body.hasOwnProperty("done")) {
      await toggleTodoInDB(id, body.done, body.category);
    } else if (body.hasOwnProperty("text")) {
      await editTodoInDB(id, body.text, body.category);
    } else {
      return NextResponse.json(
        { error: "Invalid update data" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const id = parseInt(params.id);
    await deleteTodoFromDB(id, body.category);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
