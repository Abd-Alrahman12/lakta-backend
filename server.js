const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Resend } = require("resend");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* EMAIL CONFIG */
const resend = new Resend("re_5Hp9rxtx_4XmfixAb4gYy8RgME8qBiK91"); // ← your Resend API key

/* ADMIN CREDENTIALS */
const ADMIN_USERNAME = "la8ta";      // ← your username
const ADMIN_PASSWORD = "lakta2024";  // ← your password

/* MONGODB CONNECTION */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err.message));

/* SCHEMAS */
const offerSchema = new mongoose.Schema({
  titleEn:       String,
  titleAr:       String,
  descriptionEn: String,
  descriptionAr: String,
  price:         String,
  highlight:     Boolean,
}, { timestamps: true });

const portfolioSchema = new mongoose.Schema({
  titleEn:       String,
  titleAr:       String,
  descriptionEn: String,
  descriptionAr: String,
  tag:           String,
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  name:        String,
  email:       String,
  phone:       String,
  websiteType: String,
  message:     String,
}, { timestamps: true });

const contactSchema = new mongoose.Schema({
  email:     String,
  phone:     String,
  instagram: String,
});

/* MODELS */
const Offer     = mongoose.model("Offer",     offerSchema);
const Portfolio = mongoose.model("Portfolio", portfolioSchema);
const Request   = mongoose.model("Request",   requestSchema);
const Contact   = mongoose.model("Contact",   contactSchema);

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
app.get("/api/offers", async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers.map(o => ({ ...o.toObject(), id: o._id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/offers", async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.json({ ...offer.toObject(), id: offer._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/offers/:id", async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return res.status(404).json({ error: "Not found" });
    res.json({ ...offer.toObject(), id: offer._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/offers/:id", async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PORTFOLIO */
app.get("/api/portfolio", async (req, res) => {
  try {
    const items = await Portfolio.find().sort({ createdAt: -1 });
    res.json(items.map(i => ({ ...i.toObject(), id: i._id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/portfolio", async (req, res) => {
  try {
    const item = await Portfolio.create(req.body);
    res.json({ ...item.toObject(), id: item._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/portfolio/:id", async (req, res) => {
  try {
    const item = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ ...item.toObject(), id: item._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/portfolio/:id", async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* CONTACT */
app.get("/api/contact", async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) contact = { email: "", phone: "", instagram: "" };
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/contact", async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (contact) {
      contact = await Contact.findByIdAndUpdate(contact._id, req.body, { new: true });
    } else {
      contact = await Contact.create(req.body);
    }
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* WEBSITE REQUESTS */
app.get("/api/requests", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests.map(r => ({ ...r.toObject(), id: r._id, createdAt: r.createdAt })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/requests", async (req, res) => {
  try {
    const request = await Request.create(req.body);
    res.json({ ...request.toObject(), id: request._id });

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
    } catch (emailErr) {
      console.log("❌ Email failed:", emailErr.message);
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
