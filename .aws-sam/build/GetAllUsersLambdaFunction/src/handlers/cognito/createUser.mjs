import AWS from "aws-sdk";

const cognito = new AWS.CognitoIdentityServiceProvider();
const USER_POOL_ID = process.env.USER_POOL_ID;
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const lambdaHandler = async (event) => {
  try {
    const { email, name, role, temporaryPassword = "TempPass123!" } = event;

    const createUserResponse = await cognito
      .adminCreateUser({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "false" },
          { Name: "name", Value: name },
          { Name: "custom:role", Value: role },
        ],
        TemporaryPassword: temporaryPassword,
      })
      .promise();

    await cognito
      .adminSetUserPassword({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: temporaryPassword,
        Permanent: true,
      })
      .promise();

    // Create User in dynamodb
    const user_id = Date.now().toString();
    const params = {
      TableName: "Users",
      Item: {
        user_id,
        name,
        email,
        role,
      },
    };
    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: {
        message: `User ${email} created successfully in Cognito.`,
        userDetails: {
          email,
          userStatus: createUserResponse.User.UserStatus,
        },
      },
    };
  } catch (error) {
    if (error.code === "UsernameExistsException") {
      return {
        statusCode: 400,
        body: {
          message: `User ${event.email} already exists.`,
        },
      };
    }
    return {
      statusCode: 500,
      body: {
        message: "An error occurred while creating the user. test",
        error: error.message,
      },
    };
  }
};
