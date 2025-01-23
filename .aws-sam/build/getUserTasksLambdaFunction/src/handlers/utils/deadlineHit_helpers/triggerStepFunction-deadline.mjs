import AWS from "aws-sdk";
const stepfunctions = new AWS.StepFunctions();

export const lambdaHandler = async (event) => {
  const stateMachineArn = process.env.stateMachineArn;
  const SNS_topicARN = process.env.SNS_topicARN;

  const data = event.Records[0];
  const input = JSON.stringify({
    task_id: data.messageAttributes.task_id.stringValue,
    assigned_user_email: data.messageAttributes.topicEmail.stringValue,
    SNS_topicARN: SNS_topicARN,
    Message: `Your task "${data.messageAttributes.task_title.stringValue}" has expired.`,
  });

  const params = {
    stateMachineArn,
    input,
  };

  try {
    // Start the Step Function execution
    const response = await stepfunctions.startExecution(params).promise();
    console.log("Step Function started:", response);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Step Function triggered successfully",
        executionArn: response.executionArn,
      }),
    };
  } catch (error) {
    console.error("Error triggering Step Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error triggering Step Function",
        error: error.message,
      }),
    };
  }
};
