const { saveCarEventToDb } = require('./car-events/car-events.service');

const lambdaHandler = async (event, context) => {
  try {
    for (const record of event.Records) {
      const carEvent = JSON.parse(record.body);
      await saveCarEventToDb(carEvent);
    }
    return {
      statusCode: 200,
      body: { message: 'Messages processed successfully.' },
    };
  } catch (error) {
    console.error("Something went wrong", error)
    return {
      statusCode: 400,
      body: {
        message: 'Error processing sqs messages',
      },
    };
  }
};

module.exports = {
  lambdaHandler,
};
