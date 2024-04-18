const {
  getSalesReportByOrg,
  getSalesReportByMonthYear,
  getSalesReportData,
  getSalesReportPerDriverPerYearPerMonth,
  getSalesSummaryReportByDriver,
  getPointBalanceForMonthYear,
} = require('./reports.service');
const { getEbayItem } = require('../ebay/ebay.service');
const { getMonthAbbreviation } = require('../utils');

const fetchSalesReportData = async (req, res) => {
  try {
    const data = await getSalesReportData(req.query);
    const { rows, total, offset, limit } = data;
    const sales = await Promise.all(
      rows.map(async (row) => {
        try {
          const ebayItem = await getEbayItem(row.itemId);
          return {
            ...row,
            title: ebayItem?.title,
            price: ebayItem?.price?.value,
            image: ebayItem?.image,
          };
        } catch (error) {}
      })
    );
    res.json({
      total,
      offset,
      limit,
      data: sales,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchSalesReport = async (req, res) => {
  const { type = 'summary', reportFor = 'sponsor' } = req.query;
  try {
    let data = [];
    if (type === 'detail' && reportFor === 'sponsor') {
      data = await getSalesReportByMonthYear(req.query);
    } else if (type === 'summary' && reportFor === 'sponsor') {
      data = await getSalesReportByOrg(req.query);
      data = data.map((d) => ({
        id: d.orgId,
        label: d.orgName,
        value: d.total,
      }));
    } else if (type === 'detail' && reportFor === 'driver') {
      const rows = await getSalesReportPerDriverPerYearPerMonth(req.query);
      const aggregatedData = {};

      rows.forEach((row) => {
        if (!aggregatedData[row.userId]) {
          aggregatedData[row.userId] = {
            userId: row.userId,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            data: [
              {
                date: `${getMonthAbbreviation(row.month)} ${row.year}`,
                total: row.total,
              },
            ],
          };
        }
        aggregatedData[row.userId].data.push({
          date: `${getMonthAbbreviation(row.month)} ${row.year}`,
          total: row.total,
        });
      });

      data = Object.values(aggregatedData);
    } else if (type === 'summary' && reportFor === 'driver') {
      data = await getSalesSummaryReportByDriver(req.query);
      // data = data.map((d) => ({
      //   id: d.userId,
      //   label: d.email,
      //   value: d.total,
      // }));
    }
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchPointsReport = async (req, res) => {
  try {
    const rows = await getPointBalanceForMonthYear(req.query);
    const data = {};
    for (const row of rows) {
      if (row.userId in data) {
        if (row.orgName in data[row.userId]['organizations']) {
          data[row.userId]['organizations'][row.orgName].push({
            date: `${getMonthAbbreviation(row.month)} ${row.year}`,
            pointBalance: row.pointBalance,
          });
        } else {
          data[row.userId]['organizations'][row.orgName] = [
            {
              date: `${getMonthAbbreviation(row.month)} ${row.year}`,
              pointBalance: row.pointBalance,
            },
          ];
        }
      } else {
        data[row.userId] = {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          organizations: {}
        }
        data[row.userId]['organizations'][row.orgName] = [
          {
            date: `${getMonthAbbreviation(row.month)} ${row.year}`,
            pointBalance: row.pointBalance,
          }
        ]
      }
    }
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = {
  fetchSalesReport,
  fetchSalesReportData,
  fetchPointsReport,
};
