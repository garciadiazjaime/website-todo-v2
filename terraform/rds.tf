provider "aws" {
  profile = "todo-profile"
  region = var.region # Use the region variable
}

resource "aws_dynamodb_table" "todos_table" {
  name           = "todos"
  billing_mode   = "PAY_PER_REQUEST" # On-demand pricing - free tier includes 25 WCU and 25 RCU per month
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S" # String type
  }

  # Free tier compliance settings
  point_in_time_recovery {
    enabled = false # Disable to avoid additional charges
  }

  server_side_encryption {
    enabled = false # Use default encryption to stay in free tier
  }

  tags = {
    Name = "TodosTable"
  }
}

# Output the DynamoDB table name for use in the application
output "dynamodb_table_name" {
  value = aws_dynamodb_table.todos_table.name
  description = "The name of the DynamoDB table"
}

output "dynamodb_table_arn" {
  value = aws_dynamodb_table.todos_table.arn
  description = "The ARN of the DynamoDB table"
}
