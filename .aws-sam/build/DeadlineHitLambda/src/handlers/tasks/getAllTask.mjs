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
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
      },
      body: JSON.stringify({
        message: "Tasks retrieved successfully",
        tasks: result.Items,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: "Could not fetch tasks",
        message: error.message,
      }),
    };
  }
};
