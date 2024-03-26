const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: 'us-east-1' });

async function sendMessageToSNSTopic(params = {}) {
  try {
    const command = new PublishCommand(params);
    const response = await snsClient.send(command);

    console.log('Message sent to SNS topic:', response.MessageId);
    return response.MessageId;
  } catch (err) {
    console.error('Error sending message to SNS topic:', err);
    throw err;
  }
}

module.exports = {
  sendMessageToSNSTopic,
};
