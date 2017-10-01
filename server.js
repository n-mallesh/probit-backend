import express from "express";
import bodyParser from "body-parser";
import router from './router';
import { init } from './bitController'


const port = 4545;

const app = express();
app.use(bodyParser.json());

//Index route
app.use('/', router);

app.listen(port, () => {
   init();
   console.log('server started - ', port);
});