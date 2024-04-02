
const priceConvert = (priceString, dollarPerPoint) => {
    if (typeof priceString === 'string') {
        const cleanPriceString = priceString.replace(/[^\d.]/g, '');
        const priceInCents = parseFloat(cleanPriceString);
        return Math.round(priceInCents / dollarPerPoint);
    }
    return priceString
};

export default priceConvert