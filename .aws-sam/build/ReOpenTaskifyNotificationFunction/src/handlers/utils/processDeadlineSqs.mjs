import AWS from "aws-sdk";
const sns = new AWS.SNS();

export const lambdaHandler = async (event, context) => {
  try {
    const { body, messageAttributes } = JSON.stringify(event.Records[0]);
    const topicArn = process.env.SNS_ARN;

    // Publish a message to the SNS topic with attributes for filtering
    const publishResponse = await sns
      .publish({
        TopicArn: topicArn,
        Subject: "Task Deadline",
        Message: body,
        MessageAttributes: {
          eventType: {
            DataType: "String",
            StringValue: messageAttributes?.topicEmail?.stringValue,
          },
        },
      })
      .promise();

    console.log(`Message published: ${publishResponse.MessageId}`);

    return {
      statusCode: 200,
      body: `Subscribed ${userEmail} to ${topicArn}`,
      subscriptionArn: subscriptionArn,
    };
  } catch (error) {
    console.error("Error subscribing to SNS topic:", error);

    return {
      statusCode: 500,
      body: `Failed to subscribe ${event.email} to ${topicArn}`,
      error: error.message,
    };
  }
};
