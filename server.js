const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* EMAIL CONFIG — Resend */
const resend = new Resend("re_YOUR_API_KEY_HERE"); // ← paste your Resend API key here

/* ADMIN CREDENTIALS */
const ADMIN_USERNAME = "la8ta";      // ← change to whatever you want
const ADMIN_PASSWORD = "lakta2024";  // ← change to a strong password

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

/* ADMIN LOGIN */
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

/* OFFERS */
app.get("/api/offers", (req, res) => {
  res.json(offers);
});

app.post("/api/offers", (req, res) => {
  const offer = { id: Date.now().toString(), ...req.body };
  offers.push(offer);
  res.json(offer);
});

app.put("/api/offers/:id", (req, res) => {
  const idx = offers.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  offers[idx] = { ...offers[idx], ...req.body };
  res.json(offers[idx]);
});

app.delete("/api/offers/:id", (req, res) => {
  offers = offers.filter(o => o.id !== req.params.id);
  res.json({ success: true });
});

/* PORTFOLIO */
app.get("/api/portfolio", (req, res) => {
  res.json(portfolio);
});

app.post("/api/portfolio", (req, res) => {
  const item = { id: Date.now().toString(), ...req.body };
  portfolio.push(item);
  res.json(item);
});

app.put("/api/portfolio/:id", (req, res) => {
  const idx = portfolio.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  portfolio[idx] = { ...portfolio[idx], ...req.body };
  res.json(portfolio[idx]);
});

app.delete("/api/portfolio/:id", (req, res) => {
  portfolio = portfolio.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

/* CONTACT */
app.get("/api/contact", (req, res) => {
  res.json(contact);
});

app.put("/api/contact", (req, res) => {
  contact = { ...contact, ...req.body };
  res.json(contact);
});

/* WEBSITE REQUESTS */
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

  // Respond to client immediately
  res.json(request);

  // Send email after responding
  try {
    await resend.emails.send({
      from: "Lakta <onboarding@resend.dev>",
      to: "la8tastore@gmail.com",
      subject: `New Website Request – ${req.body.name}`,
      html: `
        <h2>New Website Request</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0;color:#888">Name</td><td><strong>${req.body.name}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888">Email</td><td>${req.body.email}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888">Phone</td><td>${req.body.phone}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888">Type</td><td>${req.body.websiteType}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888">Message</td><td>${req.body.message || "No message provided"}</td></tr>
        </table>
      `
    });
    console.log("✅ Email sent for request from:", req.body.name);
  } catch (err) {
    console.log("❌ Email failed:", err.message);
  }
});

/* EMAIL TEST — remove after confirming email works */
app.get("/api/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Lakta <onboarding@resend.dev>",
      to: "la8tastore@gmail.com",
      subject: "Test Email from Lakta Server",
      html: "<p>If you receive this, email is working correctly!</p>"
    });
    res.json({ success: true, message: "Email sent! Check your inbox." });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

/* SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
