import AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const lambdaHandler = async (event) => {
  const { task_id, title, description, deadline, assigned_to, status } =
    JSON.parse(event.body);

  const params = {
    TableName: "Tasks",
    Key: { task_id },
    UpdateExpression:
      "SET title = :title, description = :description, deadline = :deadline, assigned_to = :assigned_to, #status = :status",
    ExpressionAttributeValues: {
      ":title": title,
      ":description": description,
      ":deadline": deadline,
      ":assigned_to": assigned_to,
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamodb.update(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Task updated successfully",
        updatedTask: result.Attributes,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Could not update task",
        message: error.message,
      }),
    };
  }
};
