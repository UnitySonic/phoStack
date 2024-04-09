const {
  saveOrderToDb,
  getOrdersFromDb,
  modifyOrderInDb,
  getOrderFromDb,
  createRandomOrders,
} = require('./orders.service');
const { getEbayItem } = require('../ebay/ebay.service');
const { modifyUserInDb } = require('../users/users.service');
const { sendOrderStatusChangeEmail } = require('../email/email.service');

const seedRandomOrders = async (req, res) => {
  try {
    const data = await createRandomOrders(req.query);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const saveOrder = async (req, res) => {
  try {
    
    const orderId = await saveOrderToDb(req.body);
    const order = await getOrderFromDb(orderId);
    await sendOrderStatusChangeEmail(order.orderFor.firstName, order.orderFor.email, orderId, order.orderStatus);

    
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchOrder = async (req, res) => {
  try {
    const order = await getOrderFromDb(req.params.orderId);
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const changeOrder = async (req, res) => {
  const { orderStatus } = req.body;
  const { orderId } = req.params;
  try {
    const order = await getOrderFromDb(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Not found!' });
    }

    const alreadyCanceled = order.orderStatus === 'canceled';
    const cannotCancel =
      alreadyCanceled ||
      (orderStatus === 'canceled' && order.orderStatus !== 'processing');

    if (cannotCancel) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const isCanceling =
      orderStatus === 'canceled' && order.orderStatus === 'processing';

    if (isCanceling) {
      await modifyUserInDb(order?.orderFor?.userId, {
        points: {
          orgId: order.organization?.orgId,
          amount: order.orderTotal,
          type: 'add',
        },
      });
    }

    await modifyOrderInDb(orderId, req.body);

    
    await sendOrderStatusChangeEmail(order.orderFor.firstName, order.orderFor.email, orderId, orderStatus);
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchOrders = async (req, res) => {
  try {
    const data = await getOrdersFromDb(req.query);
    const { rows, total, offset, limit } = data;
    const orders = {};

    await Promise.all(
      rows.map(async (row) => {
        try {
          const ebayItem = await getEbayItem(row.itemId);
          const orderExists = orders[row.orderId];
          if (orderExists) {
            orders[row.orderId]?.items.push({
              quantity: row.quantity,
              itemId: row.itemId,
              title: ebayItem?.title,
              price: ebayItem?.price?.value,
              image: ebayItem?.image,
              description: ebayItem?.shortDescription,
            });
          } else {
            orders[row.orderId] = {
              orderId: row.orderId,
              orderTotal: row.orderTotal,
              orderStatus: row.orderStatus,
              dollarPerPoint: row.orderDollarPerPoint,
              orderBy: {
                userId: row.orderByUserId,
                firstName: row.orderByFirstName,
                lastName: row.orderByLastName,
                userType: row.orderByUserType,
                email: row.orderByEmail,
                picture: row.orderByPicture,
                userStatus: row.orderByUserStatus,
                selectedOrgId: row.orderBySelectedOrgId,
                createdAt: row.orderByCreatedAt,
              },
              orderFor: {
                userId: row.orderForUserId,
                firstName: row.orderForFirstName,
                lastName: row.orderForLastName,
                userType: row.orderForUserType,
                email: row.orderForEmail,
                picture: row.orderForPicture,
                userStatus: row.orderForUserStatus,
                selectedOrgId: row.orderForSelectedOrgId,
                createdAt: row.orderForCreatedAt,
              },
              organization: {
                orgId: row.orgId,
                orgName: row.orgName,
                orgDescription: row.orgDescription,
                orgStatus: row.orgStatus,
                dollarPerPoint: row.orgDollarPerPoint,
              },
              createdAt: row.createdAt,
              shipping: {
                addressFirstName: row.addressFirstName,
                addressLastName: row.addressLastName,
                addressLineOne: row.addressLineOne,
                addressLineTwo: row.addressLineTwo,
                addressCity: row.addressCity,
                addressState: row.addressState,
                addressZip: row.addressZip,
                addressCountry: row.addressCountry,
              },
              items: [
                {
                  quantity: row.quantity,
                  itemId: row.itemId,
                  title: ebayItem?.title,
                  price: ebayItem?.price?.value,
                  image: ebayItem?.image,
                  description: ebayItem?.shortDescription,
                },
              ],
            };
          }
        } catch (error) {}
      })
    );

    res.json({
      total,
      offset,
      limit,
      orders: Object.values(orders),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = {
  seedRandomOrders,
  saveOrder,
  fetchOrders,
  changeOrder,
  fetchOrder,
};
