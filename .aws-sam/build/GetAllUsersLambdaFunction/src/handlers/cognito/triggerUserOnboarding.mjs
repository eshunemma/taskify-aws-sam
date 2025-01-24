import AWS from "aws-sdk";
const stepfunctions = new AWS.StepFunctions();

export const lambdaHandler = async (event) => {
  const stateMachineArn = process.env.stateMachineArn;

  const data = JSON.parse(event.body);
  const input = JSON.stringify({
    name: data.name,
    email: data.email,
    role: data.role,
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
