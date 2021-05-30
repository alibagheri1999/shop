const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
// new Email(user, url);
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(" ")[0];
    this.url = url;
    this.from = "alibagheri <bagheri.danalab@gmail.com>";
  }
  newTransport() {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: "apikey",
        pass: "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",
      },
    });
  }
  async send(template, subject) {
    //1) render html email based on pug template
    const html = pug.renderFile(`${__dirname}/email/${template}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });
    //2) define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      // html:
    };

    //3) createTransport send the email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "welcome to the hell!!!!");
  }
  async sendPasswordReset() {
    await this.send("passwordReset", "your password reset valid for 10 min");
  }
};
