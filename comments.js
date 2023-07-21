//Create web server
const express = require('express')
const app = express()
const port = 3000

//Require and use body-parser
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

//Require and use express-handlebars
const exphbs = require('express-handlebars')
app.engine('handlebars', exphbs({ defaultLayout: 'main' })) //設定預設layout
app.set('view engine', 'handlebars')

//Require and use method-override
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

//Require and use mongoose
const mongoose = require('mongoose')
mongoose.set('debug', true) //debug mode
mongoose.connect('mongodb://localhost/comment', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }) //connect to db
const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
})

//Require and use comment model
const Comment = require('./models/comment')

//Set routes
app.get('/', (req, res) => {
  Comment.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(comments => res.render('index', { comments }))
    .catch(error => console.log(error))
})

app.get('/comments/new', (req, res) => {
  res.render('new')
})

app.post('/comments', (req, res) => {
  Comment.create(req.body)
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

app.get('/comments/:id', (req, res) => {
  Comment.findById(req.params.id)
    .lean()
    .then(comment => res.render('detail', { comment }))
    .catch(error => console.log(error))
})

app.get('/comments/:id/edit', (req, res) => {
  Comment.findById(req.params.id)
    .lean()
    .then(comment => res.render('edit', { comment }))
    .catch(error => console.log(error))
})

app.put('/comments/:id', (req, res) => {
  Comment.findById(req.params.id)
    .then(comment => {
      comment.name = req.body.name
      comment.content = req.body.content
      return comment.save()
    })
    .then(() => res