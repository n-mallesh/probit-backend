import { seller, sellers } from './entities/seller'
import { buyer, buyers} from './entities/buyer'
import shares from './entities/shares'
import bitShare from './bitshare'
import db from './db'
import blockChain from './blockchain'

let isBuyActive = true;
let isSellActive = true;

export const init = () => {
    db.dropAll()
        .then( () => {
            shares.forEach( share => {
                db.insertBitShare( share.shareName );
                db.insertLegitimateShares( share.shareName );
            });
            initiateBlockChain();
        })

};

const initiateBlockChain = () => {
    setInterval(checkLegetimateShares, 3*1000);
};

const checkLegetimateShares =  () => {

    if(isBuyActive){
        db.getLegitimateSharesToBuy()
            .then(shares => {
                console.log(shares)
                if(shares) {
                    isBuyActive = shares.length >= 1 ? false : true
                    console.log(isBuyActive)
                    shares.forEach(share => {
                        let blockChainRequestsToBuy = [];

                        console.log(share)

                        let shareLimit = Math.floor(share.bitBuy);

                        console.log(shareLimit)
                        db.getBuyerByShareId(share._id)
                            .then(buyers => {
                                let bitBuy = 0.00;
                                let shareAmount = 0.00;
                                let listOfBuyersToRemove = [];
                                buyers.forEach( buyer => {
                                    console.log({buyer: buyer})
                                    bitBuy += Math.round(buyer.sharePoints * 100) / 100;
                                    shareAmount += buyer.bitShare;
                                    console.log({bitBuy: bitBuy, shareAmount: shareAmount})
                                    if (bitBuy <= shareLimit) {
                                        let shareDetails = {
                                            buyer: buyer.name,
                                            shareName: share._id,
                                            validPoints: buyer.sharePoints,
                                            validShareAmount: buyer.bitShare
                                        }
                                        //TODO: Execute Block chain
                                        console.log("before")
                                        blockChainRequestsToBuy.push(shareDetails)
                                        console.log("after")

                                        //update bitshare
                                        console.log(`removing buyer: ${buyer}`)
                                        db.removeBuyersbyId(buyer);
                                    } else {
                                        let updateParams = {}
                                        let validSharePoints = Math.round((shareLimit - ( bitBuy - buyer.sharePoints )) * 100) / 100;
                                        let validShareAmount = ( buyer.shareAmount * shareLimit ) - ( shareAmount - buyer.bitShare );
                                        // TODO: CALL BLOCKCHAIN

                                        let shareDetails = {
                                            buyer: buyer.name,
                                            shareName: share._id,
                                            validPoints: validSharePoints,
                                            validShareAmount: validShareAmount
                                        }
                                        // blockChain.buyShares(shareDetails);
                                        blockChainRequestsToBuy.push(shareDetails)

                                        updateParams.sharePoints = Math.round((bitBuy - shareLimit) * 100) / 100;
                                        updateParams.bitShare = shareAmount - (buyer.shareAmount * shareLimit);
                                        console.log({
                                            updateParams: updateParams,
                                            valid: validSharePoints,
                                            validAmount: validShareAmount
                                        })
                                        db.updateBuyer(buyer._id, updateParams);
                                    }
                                })
                            })
                            .then(() => {
                                console.log({ shareId: share._id, bitBuy: { bitBuy: - shareLimit }})
                                console.log(blockChainRequestsToBuy)
                                requestBlockChainBuy(blockChainRequestsToBuy);
                                db.incrementLegitimateShares( share._id, shareLimit )
                                db.updateBitShare(share._id, { bitBuy: - shareLimit })
                            });
                    })
                    isBuyActive = true;
                }
            })
       
        }

        if(isSellActive){
            db.getLegitimateSharesToSell()
                .then(shares => {
                    console.log(shares)
                    if(shares) {
                        isSellActive = shares.length >= 1 ? false : true
                        
                        console.log(isSellActive)
                        shares.forEach(share => {
                            let blockChainRequestsToSell = []
                            console.log(share)
                            let shareLimit = Math.floor(share.bitSell);
                            console.log(shareLimit)
                            db.getSellerByShareId(share._id)
                                .then(sellers => {
                                    let bitSell = 0.00;
                                    let shareAmount = 0.00;
                                    let listOfSellersToRemove = [];
                                    sellers.forEach( seller => {
                                        console.log({seller: seller})
                                        bitSell += Math.round(seller.sharePoints * 100) / 100;
                                        shareAmount += seller.bitShare;
                                        console.log({bitSell: bitSell, shareAmount: shareAmount})
                                        if (bitSell <= shareLimit) {
                                            let shareDetails = {
                                                seller: seller.name,
                                                shareName: share._id,
                                                validPoints: seller.sharePoints,
                                                validShareAmount: seller.bitShare
                                            }
                                            //TODO: Execute Block chain
                                            blockChainRequestsToSell.push(shareDetails)
                                            //update bitshare
                                            console.log(`removing seller: ${seller}`)
                                            db.removeSellersbyId(seller);
                                        } else {
                                            let updateParams = {}
                                            let validSharePoints = Math.round((shareLimit - ( bitSell - seller.sharePoints )) * 100) / 100;
                                            let validShareAmount = ( seller.shareAmount * shareLimit ) - ( shareAmount - seller.bitShare );
                                            // TODO: CALL BLOCKCHAIN

                                            let shareDetails = {
                                                seller: seller.name,
                                                shareName: share._id,
                                                validPoints: validSharePoints,
                                                validShareAmount: validShareAmount
                                            }
                                            blockChainRequestsToSell.push(shareDetails)
                                            // blockChain.buyShares(shareDetails);

                                            updateParams.sharePoints = Math.round((bitSell - shareLimit) * 100) / 100;
                                            updateParams.bitShare = shareAmount - (seller.shareAmount * shareLimit);
                                            console.log({
                                                updateParams: updateParams,
                                                valid: validSharePoints,
                                                validAmount: validShareAmount
                                            })
                                            db.updateSeller(seller._id, updateParams);
                                        }
                                    })
                                }).then( () => {
                                console.log("updating bit share")
                                console.log({ shareId: share._id, bitSell: { bitSell: - shareLimit }})
                                requestBlockChainSell(blockChainRequestsToSell);
                                db.decrementLegitimateShares( share._id, shareLimit )
                                db.updateBitShare(share._id, { bitSell: - shareLimit })
                            });
                        })
                        isSellActive = true;
                    }
                })

        }
    
}

const requestBlockChainBuy = blockChainRequests => {
    if (blockChainRequests.length > 0){
        let request = blockChainRequests.pop();
        blockChain.buyShares(request).then(() => {
                console.log("Block chain request", blockChainRequests);
                requestBlockChainBuy(blockChainRequests);
        });
    } else {
        return;
    }

}

const requestBlockChainSell = blockChainRequests => {
    if (blockChainRequests.length > 0){
        let request = blockChainRequests.pop();
        blockChain.sellShares(request).then(() => {
            console.log("Block chain request", blockChainRequests);
            requestBlockChainSell(blockChainRequests);
        });
    } else {
        return;
    }

}

const sell = (req, res) => {
    seller.push(req.body);
    db.insertSeller(req.body);
    db.updateBitSell( req.body.shareId, req.body.sharePoints );
    res.status(201).send();
};

const buy = ( req, res ) => {
    buyer.push(req.body);
    db.insertBuyer(req.body);
    db.updateBitBuy( req.body.shareId, req.body.sharePoints );
    res.status(201).send();
};

const getUser =  ( req, res ) => {
    console.log( "First" , req.params );
    let result = {}
    Promise.all([blockChain.getUserDetails( req.params.name ), db.getBuyers( req.params.name ),db.getSellers( req.params.name )]).then(shares => {
        console.log(shares)
        result= JSON.parse(shares[0]).User;
        result.buy = shares[1];
        result.sell = shares[2];
        res.status(200).send(result);
    });

}

const getBuyers = async ( req, res ) => {
    res.status(200).send(await db.getBuyers());
}

const getSellers = async ( req, res ) => {
    res.status(200).send(await db.getSellers());
}
export default { buy, sell, getUser, getBuyers, getSellers };

