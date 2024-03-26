const {
  getCarEvents,
  getLastCarEventChecked,
  saveLastCarEventChecked,
} = require('./car-events/car-events.service');
const { modifyUserInDb } = require('./users/users.service');
const {
  getSpeedingBehaviorsForUser,
} = require('./behaviors/behaviors.service');
const { savePointLogToDb } = require('./audit-logs/points/logs.points.service');

const applyPoints = async (userId, carEvent, behaviors) => {
  const behaviorsByOrgId = behaviors.reduce((acc, behavior) => {
    const orgId = behavior.orgId;
    acc[orgId] = acc[orgId] || [];
    acc[orgId].push(behavior);
    return acc;
  }, {});

  const { carEventSpeed, carEventSpeedLimit, carEventCreatedAt } = carEvent;
  const userSpeedOver = carEventSpeed - carEventSpeedLimit;

  const behaviorsToApply = [];

  for (const orgId in behaviorsByOrgId) {
    const orgBehaviors = behaviorsByOrgId[orgId];
    let maxSpeedThreshold = -Infinity;
    let behaviorToApply = null;

    for (const behavior of orgBehaviors) {
      let behaviorSpeedThreshold;
      // Attempt to parse speed threshold from behavior.behaviorName
      try {
        behaviorSpeedThreshold = parseInt(
          behavior.behaviorName.match(/\d+/)[0]
        );
      } catch (error) {
        // If parseInt fails, attempt to parse from behavior.behaviorDescription
        try {
          behaviorSpeedThreshold = parseInt(
            behavior.behaviorDescription.match(/\d+/)[0]
          );
        } catch (error) {
          // If parseInt fails again, skip this behavior
          continue;
        }
      }
      if (
        userSpeedOver >= behaviorSpeedThreshold &&
        behaviorSpeedThreshold > maxSpeedThreshold
      ) {
        maxSpeedThreshold = behaviorSpeedThreshold;
        behaviorToApply = behavior;
      }
    }
    if (behaviorToApply) {
      behaviorsToApply.push(behaviorToApply);
    }
  }

  for (const behavior of behaviorsToApply) {
    await savePointLogToDb({
      behaviorId: behavior.behaviorId,
      pointGivenBy: userId,
      pointGivenTo: userId,
      orgId: behavior.orgId,
      orderId: null,
    });
    await modifyUserInDb(userId, {
      points: {
        orgId: behavior.orgId,
        amount: behavior.pointValue,
        type: 'add',
      },
    });
  }
};

const lambdaHandler = async (event, context) => {
  try {
    const lastCarEventChecked = await getLastCarEventChecked();
    const carEvents = await getCarEvents({ idOffset: +lastCarEventChecked });
    for (const carEvent of carEvents) {
      try {
        const userId = carEvent.carEventUserId;
        const behaviors = await getSpeedingBehaviorsForUser(userId);
        await applyPoints(userId, carEvent, behaviors);
      } catch (error) {
        continue;
      }
    }
    await saveLastCarEventChecked(carEvents[carEvents.length - 1]?.carEventId || lastCarEventChecked)

    return {
      statusCode: 200,
      body: { message: 'Success checking car events' },
    };
  } catch (error) {
    console.error('Something went wrong', error);
    return {
      statusCode: 400,
      body: {
        message: 'Error checking car events',
      },
    };
  }
};

module.exports = {
  lambdaHandler,
};
