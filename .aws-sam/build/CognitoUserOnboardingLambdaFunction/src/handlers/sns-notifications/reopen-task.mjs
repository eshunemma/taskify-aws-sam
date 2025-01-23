import AWS from "aws-sdk";
const sns = new AWS.SNS();

export const lambdaHandler = async (event, context) => {
  try {
    const userEmail = event.Payload.body.userDetails.email;
    const topicArn = process.env.SNS_ARN;
    // Add filter policy to the subscription
    const filterPolicy = {
      eventType: ["notifyEmail", userEmail],
    };

    // Subscribe user to SNS topic
    const subscriptionResponse = await sns
      .subscribe({
        TopicArn: topicArn,
        Protocol: "email",
        Endpoint: userEmail,
        ReturnSubscriptionArn: true,
      })
      .promise();

    const subscriptionArn = subscriptionResponse.SubscriptionArn;

    await sns
      .setSubscriptionAttributes({
        SubscriptionArn: subscriptionArn,
        AttributeName: "FilterPolicy",
        AttributeValue: JSON.stringify(filterPolicy),
      })
      .promise();

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
