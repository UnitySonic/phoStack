const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const client = new SecretsManagerClient({
  region: 'us-east-1',
});

const getSecret = async (params = {}) => {
  const { secretName = 'team24/prod/mysql', VersionStage = 'AWSCURRENT' } =
    params;
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: VersionStage,
      })
    );

    return JSON.parse(response['SecretString']);
  } catch (error) {
    throw error;
  }
};

module.exports = { getSecret };
