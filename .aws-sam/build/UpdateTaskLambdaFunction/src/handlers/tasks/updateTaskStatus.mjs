import AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const TASKS_ReOpen_SNS_ARN = process.env.TASKS_ReOpen_SNS_ARN;

export const lambdaHandler = async (event) => {
  try {
    const { task_id, status } = JSON.parse(event.body);

    if (!task_id || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "task_id and status are required." }),
      };
    }
    const params = {
      TableName: "Tasks",
      Key: { task_id },
      UpdateExpression: "SET #status = :status, completed_at = :completed_at",
      ExpressionAttributeValues: {
        ":status": status,
        ":completed_at":
          status != "completed" ? null : new Date().toISOString(),
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ReturnValues: "ALL_NEW",
    };

    // Perform the update
    const result = await dynamodb.update(params).promise();

     // // Send Sns
     if(status === "open") {
      const message = {
        Subject: "Task ReOpen Reminder",
        Message: `Your task "${result.Attributes.title}" is Re-Opened`,
        TopicArn: TASKS_ReOpen_SNS_ARN,
        MessageAttributes: {
          eventType: {
            DataType: "String",
            StringValue: result.Attributes.assigned_to,
          },
        },
      };
  
      await sns.publish(message).promise();
    };

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
