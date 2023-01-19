const express = require('express');
const exphbs  = require('express-handlebars');
const pgp = require('pg-promise')();
const MangoShopper = require('./mango-shopper')

const app = express();
const PORT =  process.env.PORT || 3019;

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}

// TODO configure this to work.
const connectionString = process.env.DATABASE_URL || 'postgresql://mango:mango123@localhost:5432/mango_market';

const db = pgp(connectionString);
const mangoShopper = MangoShopper(db);


// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

let counter = 0;
app.get('/', async function(req, res){
	const best = await mangoShopper.topFiveDeals()
	res.render('index', {
		best
	})
})

app.get('/newdeal', async function(req, res) {
	const shops = await mangoShopper.listShops();
	res.render('newdeal', {
		shops
	});
});

app.post('/newdeal', async function (req, res) {
	let qty = req.body.qty;
	let price = req.body.price;
	let shopid = req.body.shopid;
	await mangoShopper.createDeal(shopid, qty, price);
	res.redirect('/');
})

app.get('/shops', async function(req, res) {
	const shops = await mangoShopper.listShops();
	res.render('shops', {
		shops
	});
});

app.get('/shops/:shopid', async function(req, res) {
	const deals = await mangoShopper.dealsForShop(req.params.shopid);
	res.render('shop', {
		deals
	})
})

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`MangoApp started on port ${PORT}`)
});