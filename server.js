const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

// const postgres = knex({
// 	client: 'pg',
// 	connection: {
// 		host: '127.0.0.1',
// 		user: 'postgres',
// 		password: '12345',
// 		database: 'smartbrain'
// 	}
// });
//  console.log(postgres.select('*').from('users'));

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password: '12345',
		database: 'smartbrain'
	}
});

// db.select('*').from('users').then(data => {
// 	console.log(data);
// });

const app = express();

app.use(express.json());

app.use(cors());

// const database = {
// 	users: [
// 		{
// 			id: '123',
// 			name: 'John',
// 			email: 'john@gmail.com',
// 			password: 'cookies',
// 			entries: 0,
// 			joined: new Date()
// 		},
// 		{
// 			id: '124',
// 			name: 'Sally',
// 			email: 'sally@gmail.com',
// 			password: 'bananas',
// 			entries: 0,
// 			joined: new Date()
// 		},
// 	]
// }

// const database = {
// 	users: [
// 		{
// 			id: '123',
// 			name: 'John',
// 			email: 'john@gmail.com',
// 			entries: 0,
// 			joined: new Date()
// 		},
// 		{
// 			id: '124',
// 			name: 'Sally',
// 			email: 'sally@gmail.com',
// 			entries: 0,
// 			joined: new Date()
// 		},
// 	],
// 	login: [
// 		{
// 			id: '987',
// 			has: '',
// 			email: 'john@gmail.com'
// 		}
// 	]
// }


app.get('/', (req, res) => {
	// res.send('this is working');
	// res.send(database.users);
	res.send('success');
});

app.post('/signin', (req, res) => {
	// Load hash from your password DB.
	// bcrypt.compare("apples", '$2a$10$ZZdNS6pP1LfnmLWe/irfS.nVi91oTsy9hZe.CFbMRCn.IDwRzEKrO', function(err, res) {
	// 	console.log('first guess', res);
	// });
	// bcrypt.compare("veggies", '$2a$10$jy9fM5stGeZXR32RIcLkEeZkrZq/U9vVCrjj1mXjajTPzz6H3yDwq', function(err, res) {
	// 	console.log('second guess', res);
	// });
	// console.log(req.body)

	// if(req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
	// 	// res.json('success');
	// 	res.json(database.users[0])
	// } else {
	// 	res.status(400).json('error logging in');
	// }

	db.select('email', 'hash').from('login')
		.where('email', '=', req.body.email)
		.then(data => {
			console.log(req.body.password)
			console.log(data[0].hash)
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			console.log(isValid)
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', req.body.email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to get user'))
			} else {
				res.status(400).json('wrong credentials')
			}
		})
		.catch(err => res.status(400).json('wrong credentials'))

})

app.post('/register', (req, res) => {
	const { email, name, password} =  req.body;

	const hash = bcrypt.hashSync(password);
	
	// bcrypt.hash(password, null, null, function(err, hash) {
	// 	// Store hash in your password DB.
	// 	console.log(hash);
	// });

	// database.users.push({
	// 	id: "125",
	// 	name: name,
	// 	email:  email,
	// 	// password: password,
	// 	entries: 0,
	// 	joined: new Date()
	// })
	
		db.transaction(trx => {
			trx.insert({
				hash: hash,
				email: email
			})
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx('users')
					.returning('*')
					.insert({
						email: loginEmail[0].email,
						name: name,
						joined: new Date()
				})
					.then(user => {
						res.json(user[0]);
				})
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => res.status(400).json('unable to register'));
	// .then(console.log)

	// res.json(database.users[database.users.length - 1]);
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	let found = false;
	// database.users.forEach(user => {
	// 	if(user.id ===  id) {
	// 		found = true;
	// 		return res.json(user);
	// 	}
	// })
	// db.select('*').from('users').where({
	// 	id: id
	// })
	// ES6 syntax below
	db.select('*').from('users').where({id})
	.then(user => {
		// console.log(user[0]);
		if (user.length) {
			res.json(user[0])
		} else {
			res.status(400).json("Not Found")
		}
	})
	.catch(err => res.status(400).json("error getting user"))
	// if (!found) {
	// 	res.status(404).json('not found');
	// }
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	// let found = false;
	// database.users.forEach(user => {
	// 	if(user.id ===  id) {
	// 		found = true;
	// 		user.entries++;
	// 		return res.json(user.entries);
	// 	}
	// })
	// if (!found) {
	// 	res.status(404).json('not found');
	// }

	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		// console.log(entries)
		res.json(entries[0].entries)
	})
	.catch(err => res.status(400).json('Unable to get entries'))
})

app.listen(3000, () => {
	console.log('app is running on port 3000');
});


// bcrypt.hash("bacon", null, null, function(err, hash) {
// 	// Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
// 	// res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
// 	// res = false
// });


/*
/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT = user

*/
