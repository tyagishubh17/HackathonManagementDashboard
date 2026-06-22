const nodemailer = require("nodemailer");

const createTransporter = async () => {
  let transporter;

  if (process.env.NODE_ENV === "production") {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development: Fallback to Ethereal if credentials aren't set
    let user = process.env.EMAIL_USER;
    let pass = process.env.EMAIL_PASS;
    let host = process.env.EMAIL_HOST;

    if (!user || user === "ethereal_user") {
      const testAccount = await nodemailer.createTestAccount();
      user = testAccount.user;
      pass = testAccount.pass;
      host = "smtp.ethereal.email";
    }

    transporter = nodemailer.createTransport({
      host: host,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: user,
        pass: pass,
      },
    });
  }

  return transporter;
};

const sendEmail = async (options) => {
  const transporter = await createTransporter();

  let htmlContent = options.html;
  
  if (options.template) {
    const ejs = require("ejs");
    const path = require("path");
    const templatePath = path.join(__dirname, "..", "templates", "emails", `${options.template}.ejs`);
    htmlContent = await ejs.renderFile(templatePath, options.data || {});
  }

  const mailOptions = {
    from: `FAIRJUDGE <${process.env.EMAIL_FROM || "noreply@fairjudge.com"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV !== "production") {
    console.log(`Email sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
};

module.exports = sendEmail;
