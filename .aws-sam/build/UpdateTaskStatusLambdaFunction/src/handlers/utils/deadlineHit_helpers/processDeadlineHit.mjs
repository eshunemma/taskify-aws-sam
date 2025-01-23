import AWS from "aws-sdk";
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export const lambdaHandler = async (event) => {
  const queueUrl = process.env.queueUrl;
  const currentTime = new Date();

  const params = {
    TableName: "Tasks",
    FilterExpression: "deadline < :now AND #status = :open",
    ExpressionAttributeValues: {
      ":now": currentTime.toISOString(),
      ":open": "open",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };
  try {
    const tasks = await dynamoDB.scan(params).promise();
    if(tasks.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Topic Hit Successfully",
        }),
      };
    }

    for (const task of tasks.Items) {
      const messageAttributes = {};
      messageAttributes["topicEmail"] = {
        DataType: "String",
        StringValue: task.assigned_to,
      };
      messageAttributes["task_id"] = {
        DataType: "String",
        StringValue: task.task_id,
      };
      messageAttributes["task_title"] = {
        DataType: "String",
        StringValue: task.title,
      };

      // Send message to Assignment Queue
      const sendMessageResponse = await sqs
        .sendMessage({
          QueueUrl: queueUrl,
          MessageBody: `Hi, your task assigned to you has expired: Title - ${task.title}.`,
          MessageAttributes: messageAttributes,
        })
        .promise();

      console.log("Message sent to SQS:", sendMessageResponse);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Topic Hit Successfully",
      }),
    };
  } catch (error) {
    console.error("Error scanning DynamoDB or sending Queue:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing tasks",
        error,
      }),
    };
  }
};
