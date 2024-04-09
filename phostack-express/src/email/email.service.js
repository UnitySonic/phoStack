const AWS = require('aws-sdk');
const { getOrganizationFromDb } = require('../organizations/organizations.service');
const {getOrderFromDb} = require("../orders/orders.service")


const ses = new AWS.SES({
    accessKeyId: process.env.AWS_SES_KEY_ID,
    secretAccessKey: process.env.AWS_SES_KEY,
    region: process.env.AWS_REGION,
  });

const senderEmail = process.env.AWS_SENDER_EMAIL;

const sendApprovalEmail = async (driverName, driverEmail, orgId) => {
  const applicationOrgInfo = await getOrganizationFromDb(orgId);

  if (applicationOrgInfo.length > 0) {
    const applicationOrgName = applicationOrgInfo[0].orgName;

    const params = {
      Destination: {
        ToAddresses: [driverEmail]
      },
      Message: {
        Body: {
          Text: {
            Data: `Congratulations ${driverName}! Your application for ${applicationOrgName} has been approved.`
          }
        },
        Subject: {
          Data: 'Application Approval Notification'
        }
      },
      Source: senderEmail
    };

    return ses.sendEmail(params).promise();
  } else {
    throw new Error('Organization not found');
  }
}

const sendRevokeEmail = async (driverName, driverEmail, orgId) => {
  const applicationOrgInfo = await getOrganizationFromDb(orgId);

  if (applicationOrgInfo.length > 0) {
    const applicationOrgName = applicationOrgInfo[0].orgName;

    const params = {
      Destination: {
        ToAddresses: [driverEmail]
      },
      Message: {
        Body: {
          Text: {
            Data: `Sorry ${driverName}! Your application for ${applicationOrgName} has been revoked.`
          }
        },
        Subject: {
          Data: 'Application Revoked Notification'
        }
      },
      Source: senderEmail
    };

    return ses.sendEmail(params).promise();
  } else {
    throw new Error('Organization not found');
  }
}


const sendOrderStatusChangeEmail = async (driverName, driverEmail, orderId, orderStatus) => {

    const params = {
      Destination: {
        ToAddresses: [driverEmail]
      },
      Message: {
        Body: {
          Text: {
            Data: `Hello ${driverName}! This is a notification to let you know the status of order #${orderId} has changed to ${orderStatus}.`
          }
        },
        Subject: {
          Data: 'Order Status Update'
        }
      },
      Source: senderEmail
    };

    return ses.sendEmail(params).promise();
  
}

module.exports = {
    sendApprovalEmail,
    sendRevokeEmail,
    sendOrderStatusChangeEmail,
}