import express from 'express';
import shares from './entities/shares'
import people from './entities/people'
import bitController from './bitController'



const router = new express.Router();

router.get('/shares', async (req, res) => {
    res.status(200).send(shares);
});

router.get('/people', async (req, res) => {
    res.status(200).send(people);
});

router.post('/buy', bitController.buy);

router.post('/sell', bitController.sell);

router.get('/user/:name', bitController.getUser);

router.get('/buyers', bitController.getBuyers);

router.get('/sellers', bitController.getSellers)


export default router