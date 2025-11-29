provider "aws" {
  profile = "todo-profile"
  region = var.aws_region # Use the region variable
}

resource "aws_dynamodb_table" "todos_table" {
  name           = "todos"
  billing_mode   = "PAY_PER_REQUEST" # On-demand pricing - free tier includes 25 WCU and 25 RCU per month
  hash_key       = "id"
  range_key      = "category"

  attribute {
    name = "id"
    type = "S" # String type
  }

  attribute {
    name = "category"
    type = "S"
  }

  tags = {
    Name = "TodosTable"
  }
}

# IAM role for Lambda functions to access DynamoDB
resource "aws_iam_role" "dynamodb_access_role" {
  name = "todos-dynamodb-access"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name    = "TodosDynamoDBAccess"
    Project = var.project_name
  }
}

# IAM policy for DynamoDB operations
resource "aws_iam_policy" "dynamodb_policy" {
  name        = "todos-dynamodb-policy"
  description = "Policy for DynamoDB operations on user todos table"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.todos_table.arn,
          "${aws_dynamodb_table.todos_table.arn}/*"
        ]
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "dynamodb_policy_attachment" {
  role       = aws_iam_role.dynamodb_access_role.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}
