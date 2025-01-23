import AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const lambdaHandler = async (event) => {
  const params = {
    TableName: "Tasks",
  };

  try {
    const result = await dynamodb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Tasks retrieved successfully",
        tasks: result.Items,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Could not fetch tasks",
        message: error.message,
      }),
    };
  }
};
