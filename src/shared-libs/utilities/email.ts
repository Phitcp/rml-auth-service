import * as nodemailer from 'nodemailer';

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}
export const mailTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Your SMTP host
    auth: {
      user: 'username@gmail.com`',
      pass: 'your-email-password',
    },
  });

  return {
    sendMail: async ({ from, to, subject, html }: MailOptions) => {
      const mailOptions = {
        from,
        to,
        subject,
        html,
      };
      await transporter.sendMail(mailOptions);
    },
  };
};
