const express = require('express');
const cors = require('cors');
const app =express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());



//root
app.get('/', (req, res) =>{
    res.send('Assignment 10 server is running')
} )

app.listen(port, ()=> {
    console.log(`assignment 10 server is running on  port ${port}`)
})
