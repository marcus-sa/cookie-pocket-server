import * as express from 'express';
import * as lusca from 'lusca';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';

import * as controllers from './controllers';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: process.env.SECRET || 'fuck gdpr'
}));
// Enable on production server
// -> app.use(lusca.csrf());
app.use(lusca.nosniff());
app.use(lusca.xssProtection(true));
app.use(lusca.referrerPolicy('same-origin'));

app.get('/', controllers.index);
app.post('/sniff', controllers.sniff);

app.listen(port, () => {
	console.log(`[CPS]: Listening on port ${port}`)
});