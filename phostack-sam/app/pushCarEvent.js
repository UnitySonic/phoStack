const { getUsersFromDb } = require('./users/users.service');
const { getPrevCarEvent } = require('./car-events/car-events.service');
const { sendMessageToSNSTopic } = require('./utils/sns');

const createNewCarEvent = (prevEvent) => {
  // Determine if the speed limit will change
  const changeSpeedLimit = Math.random() < 0.15;

  // Define possible speed limits
  const possibleSpeedLimits = [15, 25, 40, 55, 60, 70, 80, 85];

  // Define the new speed limit based on the previous event
  const newSpeedLimit = changeSpeedLimit
    ? possibleSpeedLimits[
        Math.floor(Math.random() * possibleSpeedLimits.length)
      ]
    : prevEvent.speedLimit;

  // Define speed categories and their probabilities
  const speedCategories = [
    { speed: newSpeedLimit - 5, probability: 0.1 },
    { speed: newSpeedLimit, probability: 0.5 },
    { speed: newSpeedLimit + 5, probability: 0.19 },
    { speed: newSpeedLimit + 10, probability: 0.15 },
    { speed: newSpeedLimit + 25, probability: 0.05 },
    { speed: newSpeedLimit + 50, probability: 0.01 },
  ];

  // Randomly choose a speed category based on probabilities
  let randomSpeedCategory;
  let cumulativeProbability = 0;
  const randomValue = Math.random();
  for (const category of speedCategories) {
    cumulativeProbability += category.probability;
    if (randomValue <= cumulativeProbability) {
      randomSpeedCategory = category;
      break;
    }
  }

  // Generate a random speed within the chosen speed category
  const randomSpeedChange = Math.floor(Math.random() * 11) - 5;
  let newSpeed = randomSpeedCategory.speed + randomSpeedChange;
  newSpeed = Math.min(Math.max(newSpeed, 0), 150); // Ensure speed is within range

  return {
    userId: prevEvent.userId,
    speed: newSpeed,
    speedLimit: newSpeedLimit,
    createdAt: new Date(Date.now())
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '),
  };
};

const lambdaHandler = async (event, context) => {
  try {
    const drivers = await getUsersFromDb({
      filters: { userType: 'DriverUser' },
    });

    for (const driver of drivers) {
      try {
        const userId = driver.userId;
        const prevEvent = await getPrevCarEvent(userId);
        const newEvent = createNewCarEvent(prevEvent);
        await sendMessageToSNSTopic({
          Message: JSON.stringify(newEvent),
          TopicArn: process.env.CAR_EVENT_SNS_ARN,
          MessageGroupId: 'car-event',
        });
      } catch (error) {
        console.error(error);
        continue;
      }
    }

    return {
      statusCode: 200,
      body: {
        message: 'pushData ran',
      },
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: {
        message: error,
      },
    };
  }
};

module.exports = {
  lambdaHandler,
};
