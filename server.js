const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let offers = [];
let portfolio = [];
let requests = [];
let contact = {
  email: "",
  phone: "",
  instagram: ""
};

/* OFFERS */

app.get("/api/offers", (req,res)=>{
  res.json(offers);
});

app.post("/api/offers",(req,res)=>{
  const offer = {
    id: Date.now().toString(),
    ...req.body
  };
  offers.push(offer);
  res.json(offer);
});

app.put("/api/offers/:id",(req,res)=>{
  const id = req.params.id;

  offers = offers.map(o =>
    o.id === id ? {...o,...req.body} : o
  );

  res.json({success:true});
});

app.delete("/api/offers/:id",(req,res)=>{
  const id = req.params.id;

  offers = offers.filter(o => o.id !== id);

  res.json({success:true});
});

/* PORTFOLIO */

app.get("/api/portfolio",(req,res)=>{
  res.json(portfolio);
});

app.post("/api/portfolio",(req,res)=>{
  const item = {
    id: Date.now().toString(),
    ...req.body
  };

  portfolio.push(item);

  res.json(item);
});

app.put("/api/portfolio/:id",(req,res)=>{
  const id = req.params.id;

  portfolio = portfolio.map(p =>
    p.id === id ? {...p,...req.body} : p
  );

  res.json({success:true});
});

app.delete("/api/portfolio/:id",(req,res)=>{
  const id = req.params.id;

  portfolio = portfolio.filter(p => p.id !== id);

  res.json({success:true});
});

/* CONTACT */

app.get("/api/contact",(req,res)=>{
  res.json(contact);
});

app.put("/api/contact",(req,res)=>{
  contact = {...contact,...req.body};
  res.json(contact);
});

/* REQUESTS */

app.get("/api/requests",(req,res)=>{
  res.json(requests);
});

app.post("/api/requests",(req,res)=>{
  const request = {
    id: Date.now().toString(),
    createdAt: new Date(),
    ...req.body
  };

  requests.push(request);

  res.json(request);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("Server running on port",PORT);
});
