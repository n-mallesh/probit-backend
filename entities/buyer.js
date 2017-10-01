let buyers = [];
let buyer = {
    push : obj => {
        buyers.push(obj);
    }
};

export { buyer, buyers };