export interface Todo {
  id: number;
  text: string;
  done: boolean;
  list: ListType;
}

export type ListType = "VALLEY" | "TRADER" | "DEFAULT";
