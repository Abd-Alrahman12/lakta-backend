const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* EMAIL CONFIG */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "la8tastore@gmail.com",
    pass: "coom etfr atbu wnzg"
  }
});

/* DATA */

let offers = [];
let portfolio = [];
let requests = [];

let contact = {
  email: "",
  phone: "",
  instagram: ""
};

/* WEBSITE ROOT */

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

/* OFFERS */

app.get("/api/offers", (req, res) => {
  res.json(offers);
});

app.post("/api/offers", (req, res) => {
  const offer = {
    id: Date.now().toString(),
    ...req.body
  };

  offers.push(offer);
  res.json(offer);
});

app.delete("/api/offers/:id", (req, res) => {
  const id = req.params.id;

  offers = offers.filter(o => o.id !== id);

  res.json({ success: true });
});

/* PORTFOLIO */

app.get("/api/portfolio", (req, res) => {
  res.json(portfolio);
});

app.post("/api/portfolio", (req, res) => {
  const item = {
    id: Date.now().toString(),
    ...req.body
  };

  portfolio.push(item);
  res.json(item);
});

/* CONTACT */

app.get("/api/contact", (req, res) => {
  res.json(contact);
});

app.put("/api/contact", (req, res) => {
  contact = { ...contact, ...req.body };
  res.json(contact);
});

/* REQUESTS (WEBSITE ORDERS) */

app.get("/api/requests", (req, res) => {
  res.json(requests);
});

app.post("/api/requests", async (req, res) => {

  const request = {
    id: Date.now().toString(),
    createdAt: new Date(),
    ...req.body
  };

  requests.push(request);

  try {

    await transporter.sendMail({
      from: "YOUR_EMAIL@gmail.com",
      to: "YOUR_EMAIL@gmail.com",
      subject: "New Website Request",
      text: JSON.stringify(req.body, null, 2)
    });

  } catch (err) {
    console.log("Email error:", err);
  }

  res.json(request);
});

/* SERVER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
