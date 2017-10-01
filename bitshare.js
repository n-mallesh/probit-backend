let bitBuy = 0.0;
let bitSell = 0.0;

const getBitBuy = (sharePoints) => { return  Math.round((bitBuy += sharePoints) * 100) / 100  };

const getBitSell = (sharePoints) => { return Math.round((bitSell += sharePoints) * 100) / 100 };

export default { getBitBuy, getBitSell }