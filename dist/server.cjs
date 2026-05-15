var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var PORT = 3e3;
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  app.post("/api/send-order-email", async (req, res) => {
    const { orderData, customerEmail } = req.body;
    if (!orderData || !customerEmail) {
      return res.status(400).json({ error: "Missing order data or customer email" });
    }
    try {
      const transporter = import_nodemailer.default.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: process.env.SMTP_SECURE === "true",
        // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      const itemsHtml = orderData.items.map((item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `).join("");
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #C5A059; text-align: center; font-serif">Order Confirmation - ${orderData.trackingId}</h2>
          <p>Dear ${orderData.customer.name},</p>
          <p>Thank you for shopping with UFR COLLECTION. We have received your order and it is now being processed.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <p><strong>Order ID:</strong> ${orderData.trackingId}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
            <p><strong>Shipping Address:</strong> ${orderData.customer.address}, ${orderData.customer.city}</p>
            <p><strong>Phone:</strong> ${orderData.customer.phone}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f3f3;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal</strong></td>
                <td style="padding: 10px; text-align: right;">Rs. ${(orderData.totalAmount - orderData.shippingFee).toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Shipping</strong></td>
                <td style="padding: 10px; text-align: right;">Rs. ${orderData.shippingFee.toLocaleString()}</td>
              </tr>
              <tr style="font-size: 1.2em; color: #C5A059;">
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>Rs. ${orderData.totalAmount.toLocaleString()}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 30px; text-align: center; color: #888; font-size: 0.9em;">
            <p>If you have any questions, please contact us on WhatsApp: 0300 1234567</p>
            <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} UFR COLLECTION. All rights reserved.</p>
          </div>
        </div>
      `;
      await transporter.sendMail({
        from: `"UFR COLLECTION" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: `Order Received - ${orderData.trackingId}`,
        html: emailHtml
      });
      if (adminEmail) {
        await transporter.sendMail({
          from: `"UFR COLLECTION Orders" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `NEW ORDER: ${orderData.trackingId} by ${orderData.customer.name}`,
          html: `<h3>New Order Received</h3>${emailHtml}`
        });
      }
      res.status(200).json({ message: "Emails sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email notification" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const __dirname = import_path.default.resolve();
    app.use(import_express.default.static(import_path.default.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
