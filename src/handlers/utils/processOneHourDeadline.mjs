import AWS from "aws-sdk";
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

const TASKS_DEADLINE_TOPIC_ARN = process.env.TASKS_DEADLINE_TOPIC_ARN;

export const lambdaHandler = async (event) => {
  const currentTime = new Date();
  const oneHourAhead = new Date(currentTime.getTime() + 60 * 60 * 1000);

  const params = {
    TableName: "Tasks",
    FilterExpression:
      "deadline BETWEEN :now AND :oneHourAhead AND #status = :open",
    ExpressionAttributeValues: {
      ":now": currentTime.toISOString(),
      ":oneHourAhead": oneHourAhead.toISOString(),
      ":open": "open",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  const tasks = await dynamoDB.scan(params).promise();

  for (const task of tasks.Items) {
    const message = {
      Subject: "Task Deadline Reminder",
      Message: `Reminder: Your task "${task.title}" is due in 1 hour.\nDeadline: ${task.deadline}`,
      TopicArn: TASKS_DEADLINE_TOPIC_ARN,
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: task.assigned_to,
        },
      },
    };

    await sns.publish(message).promise();
    console.log("Notification sent for task:", task.task_name);
  }
};
