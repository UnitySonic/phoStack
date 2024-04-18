const {
    getOrdersFromDb,
  } = require('../orders/orders.service');

const fetchInvoice = async (req, res) => {
    try {
        
        const data = await getOrdersFromDb(req.query);
        const { rows, total, offset, limit } = data;
        const orders = {};
    
        await Promise.all(
        rows.map(async (row) => {
            try {
            const orderExists = orders[row.orderId];
            if (orderExists) {
                orders[row.orderId]?.items.push({
                quantity: row.quantity,
                itemId: row.itemId,
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
                    itemId: row.itemId
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
  }

  module.exports = {
    fetchInvoice
  };