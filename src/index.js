var express = require('express');

const app = express();

console.log('hello world')

app.get('/:userId', (req, res) => res.send(req.params.userId))

app.listen(3000, () => console.log('Example app listening on port 3000!'))