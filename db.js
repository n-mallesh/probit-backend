import mongo from 'mongodb'
// Connection url
let url = 'mongodb://localhost:27017/probit';

const getMongoConnection = () => { return mongo.MongoClient.connect(url).catch(err => {
    console.log("Mongo error", err);
}); };

const insertBuyer = buyer => {
    getMongoConnection()
        .then(db => {
            db.collection('buyer').insert(buyer);
        })
        .catch(err => {
            console.log("Error while inserting buyer")
        })
};

const insertSeller = seller => {
    getMongoConnection()
        .then(db => {
            db.collection('seller').insert(seller);
        })
        .catch(err => {
            console.log("Error while inserting seller")
        })
};

const updateBuyer = (( _id, updateParameters ) => {

    getMongoConnection()
        .then( db => {
            db.collection('buyer').update({
                _id: _id
            },{
                $set: updateParameters
            })
        })
})

const updateSeller = (( _id, updateParameters ) => {

    getMongoConnection()
        .then( db => {
            db.collection('seller').update({
                _id: _id
            },{
                $set: updateParameters
            })
        })
})

const updateBitBuy = ( shareId, bitBuy ) => {
    console.log({shareId:shareId,bitBuy:bitBuy})
    getMongoConnection()
        .then(db => {
            db.collection('bitShare').update({
                _id: shareId
            }, { "$inc" : {
                    bitBuy: bitBuy
            }});
        })
        .catch(err => {
            console.log("Error while inserting buyer")
        })
};

const updateBitSell = ( shareId, bitSell ) => {
    getMongoConnection()
        .then(db => {
            db.collection('bitShare').update({
                _id: shareId
            }, { "$inc" : {
                bitSell: bitSell
            }});
        })
        .catch(err => {
            console.log("Error while inserting buyer")
        })
};

const insertBitShare = shareId => {
    console.log("Inserting bitShare")
    getMongoConnection()
        .then(db => {
            db.collection('bitShare').insert({
                _id: shareId,
                bitBuy: 0.0,
                bitSell: 0.0
            });
        })
        .catch(err => {
            console.log("Error while inserting bitShare")
        })
};

const dropAll = () => {
    return new Promise( (resolve) => {
        console.log("dropping collection")
        getMongoConnection()
            .then(db => {
                db.collection('bitShare').drop();
                db.collection('legetimateShares').drop();
                db.collection('buyer').drop();
                db.collection('seller').drop();
                console.log("Done dropping");
                resolve()
             })
            .catch(err => {
                console.log("Error while dropping bitShare")
            })
        })
};



const getLegitimateSharesToBuy = () => {
    return new Promise( resolve => {
        console.log("Getting legitimate shares to buy")
        getMongoConnection()
            .then(db => {
                db.collection('bitShare').find({
                    bitBuy: {
                        $gte: 1
                    }
                }).toArray( (err, shares ) => {
                    console.log({shares: shares})
                    resolve(shares)
                });
                db.close();
            })
            .catch(err => {
                console.log("Error while getting LegitimateShares to Buy",err)
            })
    })

};


const getLegitimateSharesToSell = () => {
    return new Promise( resolve => {
        console.log("Getting legitimate shares to sell")
        getMongoConnection()
            .then(db => {
                db.collection('bitShare').find({
                    bitSell: {
                        $gte: 1
                    }
                }).toArray( (err, shares ) => {
                    console.log({shares: shares})
                    resolve(shares)
                });
                db.close();
            })
            .catch(err => {
                console.log("Error while getting LegitimateShares to Sell",err)
            })
    })

};

const incrementLegitimateShares = (shareId, noOfShares) => {
    getMongoConnection()
        .then( db => {
            db.collection("legetimateShares").update(
                { _id: shareId },
                {$inc : {
                    noOfShares: noOfShares
                }}
            )
        })
}

const decrementLegitimateShares = shareId => {
    getMongoConnection()
        .then( db => {
            db.collection("legetimateShares").update(
                { _id: shareId },
                {$inc : {
                    noOfShares: -1
                }}
            )
        })
}

const updateBitShare = ( shareId, updatedBitShare) => {
    console.log(updatedBitShare)
    getMongoConnection()
        .then( db => {
            db.collection("bitShare").update(
                { _id: shareId },
                {$inc : updatedBitShare}
            )
        })
}

const insertLegitimateShares = shareId => {
    console.log("inserting legtimate shares")
    getMongoConnection()
        .then( db => {
            db.collection("legetimateShares").insert({
                    _id: shareId,
                    noOfshares: 0
                })
        })
}

const getBuyerByShareId = shareId => {
    return new Promise( resolve => {
        getMongoConnection()
            .then( db => {
                db.collection("buyer").find({ shareId: shareId}).sort({
                    _id: 1
                }).toArray( (err, buyers ) => {
                    resolve(buyers);
                })
            });
    })

}

const getSellerByShareId = shareId => {
    return new Promise( resolve => {
        getMongoConnection()
            .then( db => {
                db.collection("seller").find({ shareId: shareId}).sort({
                    _id: 1
                }).toArray( (err, sellers ) => {
                    resolve(sellers);
                })
            });
    })

}

const removeBuyersbyId = buyer => {
    getMongoConnection()
        .then( db => {
            console.log("removing buyer")
            db.collection('buyer').remove(buyer);
        })

}

const removeSellersbyId = seller => {
    getMongoConnection()
        .then( db => {
            console.log("removing seller")
            db.collection('seller').remove(seller);
        })

}

const getBuyers = ( name ) => {
    return new Promise( resolve => {
        let findQuery = name? {name: name} : {}
        getMongoConnection()
            .then( db => {
                db.collection('buyer').find(findQuery)
                    .toArray(( err, buyers ) => {
                        resolve(buyers)
                })
            })
    })
}

const getSellers = name => {
    return new Promise( resolve => {
        let findQuery = name? {name: name} : {}
        getMongoConnection()
            .then( db => {
                db.collection('seller').find(findQuery)
                    .toArray(( err, sellers ) => {
                        resolve(sellers)
                    })
            })
    })
}

const getRequestedSharesByUser = (name ) => {
    console.log(name)

        return getMongoConnection()
            .then( db => {
                console.log({ name: name })
                let requestedShares = {}

                db.collection('seller').find({ name: name })
                    .toArray( (err, sellers) => {
                        console.log("Here we are");
                        console.log(sellers)
                        requestedShares.sell = sellers

                    })
                db.collection('buyer').find({ name: name })
                    .toArray(( err, buyers ) => {
                        console.log(buyers)
                        requestedShares.buy = buyers
                    })
                console.log({requestedShares:requestedShares})
                return requestedShares
            })


}

export default { removeSellersbyId, updateSeller, getSellerByShareId, getLegitimateSharesToSell, getRequestedSharesByUser, getSellers, getBuyers, insertBuyer, insertSeller, updateBitSell, updateBitBuy, insertBitShare, dropAll, getLegitimateSharesToBuy,insertLegitimateShares, updateBuyer, removeBuyersbyId, getBuyerByShareId, decrementLegitimateShares, updateBitShare, incrementLegitimateShares }
