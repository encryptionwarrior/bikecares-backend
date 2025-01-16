import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import logger from "../logger/winston.logger.js";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Bike Cares",
      link: "https://bikecares.app",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mailtrap@tutorbe.com",
    to: options?.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    logger.error(
      "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
    );
    logger.error("Error: ", error);
  }
};


const emailVerificationMailgenContent = ( username, verificationUrl ) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our app! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email please click on the following button:",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help",
        }
    }
}


const bookingSuccessMailgenContent = (username, bookingetaurl, bookingdetails) => {
  return {
      body: {
          name: username,
          intro: `Thank you for booking with us, ${username}! Below are your booking details:`,
          table: {
              data: bookingdetails.map((detail) => ({
                  key: detail.label,
                  value: detail.value,
              })),
              columns: {
                  customWidth: {
                      key: '30%',
                      value: '70%',
                  },
              },
          },
          action: {
              instructions: "Track your booking status here:",
              button: {
                  color: "#22BC66",
                  text: "Track your booking",
                  link: bookingetaurl,
              },
          },
          outro: "Need help, or have questions? Just reply to this email, we're here to assist you.",
      },
  };
};

export {
    sendEmail, emailVerificationMailgenContent, bookingSuccessMailgenContent
}