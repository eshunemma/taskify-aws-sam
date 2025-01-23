import AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
import { v4 as uuidv4 } from "uuid";

export const lambdaHandler = async (event) => {
  const { title, description, deadline, responsibility, assigned_to } =
    JSON.parse(event.body);
  const queueUrl = process.env.queueUrl;

  const task_id = uuidv4();
  const params = {
    TableName: "Tasks",
    Item: {
      task_id,
      title,
      description,
      deadline: `${new Date(deadline).toISOString()}`,
      status: "open",
      assigned_to,
      created_at: `${new Date().toISOString()}`,
      completed_at: null,
      responsibility,
    },
  };

  try {
    await dynamodb.put(params).promise();

    const messageAttributes = {};
    messageAttributes["topicEmail"] = {
      DataType: "String",
      StringValue: assigned_to,
    };

    // Send message to Assignment Queue
    const sendMessageResponse = await sqs
      .sendMessage({
        QueueUrl: queueUrl,
        MessageBody: `Hi, you been assigned with this task: ${title}.`,
        MessageAttributes: messageAttributes,
      })
      .promise();

    console.log("Message sent to SQS:", sendMessageResponse);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Task created",
        task_id,
        queueSent: sendMessageResponse,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Could not create task",
        error: error.message,
      }),
    };
  }
};
