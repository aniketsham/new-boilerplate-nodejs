import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

interface apiResponse {
  success: boolean;
  message: string;
}

export async function sendResetEmail(
  email: string,
  resetUrl: string
): Promise<apiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Your Password',
      html: `
          <html lang="en" dir="ltr">
            <head>
              <title>Reset Your Password</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap');
                body {
                  font-family: 'Roboto', Verdana, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 40px auto;
                  background: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .button {
                  background-color: #61dafb;
                  color: #fff;
                  padding: 12px 24px;
                  border-radius: 5px;
                  text-decoration: none;
                  display: inline-block;
                  font-size: 16px;
                  margin-top: 20px;
                }
                .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #555;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Hello ${email},</h2>
                <p>
                  We received a request to reset your password. You can reset it by clicking the button below:
                </p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p>
                  If you did not request a password reset, please ignore this email or contact our support team if you have concerns.
                </p>
                <div class="footer">
                  <p>© 2025 Your Company. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
    });
    console.log(data);
    console.log(error);
    return { success: true, message: 'Verification email sent successfully' };
  } catch (emailError) {
    console.error('Error sending verification email', emailError);
    return {
      success: false,
      message: 'Failed to Send Verification Email ',
    };
  }
}
