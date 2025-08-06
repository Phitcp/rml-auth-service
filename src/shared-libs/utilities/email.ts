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
      user: 'caophi0123@gmail.com',
      pass: 'grex ygec iufl tqzr',
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
