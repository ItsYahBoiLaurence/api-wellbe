import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { Resend } from 'resend';
import { EmailContent } from 'src/types/email';
import { BulkUsers, EmailOptions } from 'src/types/invite';
import { EmailData } from 'src/types/resend';

@Processor('email')
export class EmailProcessor {
    private resend: Resend
    private logger = new Logger(EmailProcessor.name)

    constructor(private readonly configService: ConfigService) {
        this.resend = new Resend(configService.get<string>('RESEND_API_KEY'))
    }

    private WELCOME_EMAIL_TEMPLATE = (emailContent: EmailContent) => {
        return `<!DOCTYPE html>
        <html>
            <head>
                <style>
                    body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                    }
                    .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    overflow: hidden;
                    }
                    .header {
                    background-color: #040237;
                    text-align: center;
                    padding: 20px;
                    }
                    .header img {
                    max-width: 150px;
                    height: auto;
                    }
                    .content {
                    padding: 20px;
                    color: #333333;
                    line-height: 1.5;
                    }
                    .footer {
                    background-color: #f1f1f1;
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #666666;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <img src="https://lh3.googleusercontent.com/fife/ALs6j_EhLAk44tlsWu-u6Vr0-clvo7ucOt2TTCGYoOaeZiQH1KeyMC0o7tfnT9Acq8TNu8mCXM8lmSZK0-f2jvtg1JwYOCzpZmC4nqdoAEAInqewBEY0R86XLE-GVMvErUK0B7LwTULKp4dFW8SCxASlHuYow0qIUhl5gMeckZmT7YT1vNuNTtKNYU_Xq2b_AiRi6tjBW22dYCdHr5MJjRu1oLiuYOz83nPpduvmcycQaxn1ugkqAihBfm9dyfsfLtvdU7xiz8S4Bwh5QMCWegyA8V0BPzPw_2gnjSupqG6OyPTDa2BocL5wD2R6D7c-TSVfZ1H5RKBCZFGlJRDBf_oVZ7Y2obdHv30g5YHO9LFTBCs5N0rCyUjj4AXoYUwDccsJVkLkuR28tmuYLNhgolHajsu551vXrAwZI4-FzCbXDQBdwe_hhk5z41RYxA8QtDNa74VvEXfnuVbowsOTHlfjyUTpCZSi2yAwA8MNcqGKupJw2EpxvZ3M5ck9ghr-kvQ8EAft1sCEJZJcMvQg8VBuK7ZjjuLpHJDLHJQU-TlLveXUki90YnuXOhQMIflAKK90bRDebNcH1tWcWvZTuLIkVEB5gZaDg2ywFevr9YpCZV6-tbBS3E33knh54mB1OMekdGAEB-abfUresNVBsOx4J8g2kLrPCgKuzSawxsCO057yQN2yhsnAG8IaCpfs9cTyhA5JFo7ib-0iIb9IaEDrmwpIvqn-fMH_0jq7LU2XALyG8a-tcxqF6MjLUC9bSokezkEkeOE2QSc7bShh0zzglqyNQN1VD4OC7x-JKlkX8T5iuzac_EYwh8-mFNFXczuRVQCDU4GC59dqLyv8dtASZTD_oHekVRqLOAtBYtWX9JG9iTToXcQ6z-cZLMEYiGqrZikZgGUum8OhKX6pvLzBMz96TUpIXBxMYFkTyZkxyqNsjk72dvK4S-q5sN5rs6EmLwgo31SJhba7PGwkaS5t9CCDxChhET1EkSi4lXKP7GGQ8NbvayEN9mtAQ831pzMJc0kav46e3I4e0b97Pqn93UdXAhONkuTC68xeL-r1g4NrfQdrHz62QB-PjJuhIhAvciWaCaFtGTbVgULQH-1Js26mXAuwPiiiSlV6luG_t95ik2OPeaGQPq5qV3SDz0Lgyst9SjOsW6sQfLDF0LAgn-jh6e5n_2RVuMfwASPl0IJzSDeSCDGLuR5ja4vwKBchi6eE4whAb0Qmv4P3_K4-0Q_DjctGEslHpNspdhsUoTB7r0PPU6CM8FlX5zEv76UpsIIfJikyFCj3ZkkQL5WMJNz6PDx2mtGfeXrhcuDz1-z3I-bG5CQ8XeZZxl3O0GGPRiFFL9EZVq6ZajLz583ooJpIEbwlQ5bkQ4N4ZqP6PZFnIzjJWP5bsJVga6-PVNZjhVC1xq2_DnmZRaTseV5TMkVAiMHdNjc-tObMEbMIxKwEN3vv9Gl9Bpyo6bw0PHoIr20V9L8iyP6e4eXH-HAPE3AwFiEti5-kqSLY7oo6hsMPvpsz-S6FoH8V4j4roABtgV8KWxURIM5QzZLep11F-KCi8pSf1-sd4oWuWKhnIqjcE01gQZwyfsCc_brwW5nHNlxPliVmTKmheIz8njVdt4EKeJ_S2I05nQu49qi3A0l_vgoFNs4mmVMUTGqAUxbHUdETfjP6AEpMPVgEmyzkqp6HQwCz-Q=w1920-h870" alt="Wellbe" />
                    </div>
                    <div class="content">
                        <h1 style="color: #040237;">Start your journey to a better you with WellBe – because your health matters!</h1>
                        <p>Dear ${emailContent.user},</p>
                        <p>
                            Your forms are ready to fill up! You can go to your app and start answering our WellBe questions. In order for you to receive personalized advice and monitor your well-being, please take a few minutes to complete the assessment. This will help us understand your current well-being status and provide you with the necessary support to enhance your well-being at work.
                        </p>
                        <p>Here's are the Benefits of Monitoring Your Wellbeing:</p>
                        <ul>
                            <li><strong>Early Detection:</strong> Identify signs of stress or anxiety before they escalate.</li>
                            <li><strong>Improved Resilience:</strong> Build coping strategies to handle life's challenges.</li>
                            <li><strong>Better Decision-Making:</strong> Make informed choices about self-care and seeking support.</li>
                            <li><strong>Enhanced Relationships:</strong> Manage emotions for healthier personal and professional connections.</li>
                            <li><strong>Increased Productivity:</strong> Stay focused and motivated, improving work performance.</li>
                        </ul>
                        <p>Tap this <a href="https://employee-wellbe.vercel.app/" style="color: #040237;">link</a> to start your Wellbe journey!</p>
                        <p>If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #040237;">contact us</a>.</p>
                        <p>Best regards,</p>
                        <p>The ${emailContent.company} Team</p>
                    </div>
                    <div class="footer">
                        &copy; 2025 Wellbe: Your Wellbeing Buddy. All rights reserved.<br/>
                    </div>
                </div>
            </body>
    </html>`
    }

    private REMINDER_EMAIL_TEMPLATE = (emailContent: EmailContent) => {
        return `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border: 1px solid #dddddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #040237;
          text-align: center;
          padding: 20px;
        }
        .header img {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px;
          color: #333333;
          line-height: 1.5;
        }
        .footer {
          background-color: #f1f1f1;
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://lh3.googleusercontent.com/fife/ALs6j_EhLAk44tlsWu-u6Vr0-clvo7ucOt2TTCGYoOaeZiQH1KeyMC0o7tfnT9Acq8TNu8mCXM8lmSZK0-f2jvtg1JwYOCzpZmC4nqdoAEAInqewBEY0R86XLE-GVMvErUK0B7LwTULKp4dFW8SCxASlHuYow0qIUhl5gMeckZmT7YT1vNuNTtKNYU_Xq2b_AiRi6tjBW22dYCdHr5MJjRu1oLiuYOz83nPpduvmcycQaxn1ugkqAihBfm9dyfsfLtvdU7xiz8S4Bwh5QMCWegyA8V0BPzPw_2gnjSupqG6OyPTDa2BocL5wD2R6D7c-TSVfZ1H5RKBCZFGlJRDBf_oVZ7Y2obdHv30g5YHO9LFTBCs5N0rCyUjj4AXoYUwDccsJVkLkuR28tmuYLNhgolHajsu551vXrAwZI4-FzCbXDQBdwe_hhk5z41RYxA8QtDNa74VvEXfnuVbowsOTHlfjyUTpCZSi2yAwA8MNcqGKupJw2EpxvZ3M5ck9ghr-kvQ8EAft1sCEJZJcMvQg8VBuK7ZjjuLpHJDLHJQU-TlLveXUki90YnuXOhQMIflAKK90bRDebNcH1tWcWvZTuLIkVEB5gZaDg2ywFevr9YpCZV6-tbBS3E33knh54mB1OMekdGAEB-abfUresNVBsOx4J8g2kLrPCgKuzSawxsCO057yQN2yhsnAG8IaCpfs9cTyhA5JFo7ib-0iIb9IaEDrmwpIvqn-fMH_0jq7LU2XALyG8a-tcxqF6MjLUC9bSokezkEkeOE2QSc7bShh0zzglqyNQN1VD4OC7x-JKlkX8T5iuzac_EYwh8-mFNFXczuRVQCDU4GC59dqLyv8dtASZTD_oHekVRqLOAtBYtWX9JG9iTToXcQ6z-cZLMEYiGqrZikZgGUum8OhKX6pvLzBMz96TUpIXBxMYFkTyZkxyqNsjk72dvK4S-q5sN5rs6EmLwgo31SJhba7PGwkaS5t9CCDxChhET1EkSi4lXKP7GGQ8NbvayEN9mtAQ831pzMJc0kav46e3I4e0b97Pqn93UdXAhONkuTC68xeL-r1g4NrfQdrHz62QB-PjJuhIhAvciWaCaFtGTbVgULQH-1Js26mXAuwPiiiSlV6luG_t95ik2OPeaGQPq5qV3SDz0Lgyst9SjOsW6sQfLDF0LAgn-jh6e5n_2RVuMfwASPl0IJzSDeSCDGLuR5ja4vwKBchi6eE4whAb0Qmv4P3_K4-0Q_DjctGEslHpNspdhsUoTB7r0PPU6CM8FlX5zEv76UpsIIfJikyFCj3ZkkQL5WMJNz6PDx2mtGfeXrhcuDz1-z3I-bG5CQ8XeZZxl3O0GGPRiFFL9EZVq6ZajLz583ooJpIEbwlQ5bkQ4N4ZqP6PZFnIzjJWP5bsJVga6-PVNZjhVC1xq2_DnmZRaTseV5TMkVAiMHdNjc-tObMEbMIxKwEN3vv9Gl9Bpyo6bw0PHoIr20V9L8iyP6e4eXH-HAPE3AwFiEti5-kqSLY7oo6hsMPvpsz-S6FoH8V4j4roABtgV8KWxURIM5QzZLep11F-KCi8pSf1-sd4oWuWKhnIqjcE01gQZwyfsCc_brwW5nHNlxPliVmTKmheIz8njVdt4EKeJ_S2I05nQu49qi3A0l_vgoFNs4mmVMUTGqAUxbHUdETfjP6AEpMPVgEmyzkqp6HQwCz-Q=w1920-h870" alt="Wellbe" />
        </div>
        <div class="content">
          <h1 style="color: #040237;">You have ${emailContent.left} sessions left to complete!</h1>
          <p>Dear ${emailContent.user},</p>
          <p>
            We want to remind you that you have ${emailContent.left} more sessions pending that need your attention. Taking a moment to answer your current form will help you understand where you stand in terms of your mental well-being. By completing these sessions, you’ll gain valuable insights into how you’re feeling, identify areas of improvement, and receive personalized recommendations to support your overall health.
          </p>
          <p>Don’t wait—your well-being is important, and completing your forms is a key step in understanding how to better care for yourself. Answer your current form now, and continue your journey towards a healthier, more balanced state of mind.</p>
          <p>We’re here to support you every step of the way!</p>
          <p>Tap this <a href="https://employee-wellbe.vercel.app/" style="color: #040237;">link</a> to return to your Wellbe app and continue your journey to workplace wellbeing!</p>
          <p>If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #040237;">contact us</a>.</p>
          <p>Best regards,</p>
          <p>The ${emailContent.company} Team</p>
        </div>
        <div class="footer">
          &copy; 2025 Wellbe: Your Wellbeing Buddy. All rights reserved.<br/>
        </div>
      </div>
    </body>
    </html>`
    }

    private INVITE_EMAIL_TEMPLATE = (emailContent: EmailContent) => {
        return `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border: 1px solid #dddddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #040237;
          text-align: center;
          padding: 20px;
        }
        .header img {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px;
          color: #333333;
          line-height: 1.5;
        }
        .footer {
          background-color: #f1f1f1;
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://lh3.googleusercontent.com/fife/ALs6j_EhLAk44tlsWu-u6Vr0-clvo7ucOt2TTCGYoOaeZiQH1KeyMC0o7tfnT9Acq8TNu8mCXM8lmSZK0-f2jvtg1JwYOCzpZmC4nqdoAEAInqewBEY0R86XLE-GVMvErUK0B7LwTULKp4dFW8SCxASlHuYow0qIUhl5gMeckZmT7YT1vNuNTtKNYU_Xq2b_AiRi6tjBW22dYCdHr5MJjRu1oLiuYOz83nPpduvmcycQaxn1ugkqAihBfm9dyfsfLtvdU7xiz8S4Bwh5QMCWegyA8V0BPzPw_2gnjSupqG6OyPTDa2BocL5wD2R6D7c-TSVfZ1H5RKBCZFGlJRDBf_oVZ7Y2obdHv30g5YHO9LFTBCs5N0rCyUjj4AXoYUwDccsJVkLkuR28tmuYLNhgolHajsu551vXrAwZI4-FzCbXDQBdwe_hhk5z41RYxA8QtDNa74VvEXfnuVbowsOTHlfjyUTpCZSi2yAwA8MNcqGKupJw2EpxvZ3M5ck9ghr-kvQ8EAft1sCEJZJcMvQg8VBuK7ZjjuLpHJDLHJQU-TlLveXUki90YnuXOhQMIflAKK90bRDebNcH1tWcWvZTuLIkVEB5gZaDg2ywFevr9YpCZV6-tbBS3E33knh54mB1OMekdGAEB-abfUresNVBsOx4J8g2kLrPCgKuzSawxsCO057yQN2yhsnAG8IaCpfs9cTyhA5JFo7ib-0iIb9IaEDrmwpIvqn-fMH_0jq7LU2XALyG8a-tcxqF6MjLUC9bSokezkEkeOE2QSc7bShh0zzglqyNQN1VD4OC7x-JKlkX8T5iuzac_EYwh8-mFNFXczuRVQCDU4GC59dqLyv8dtASZTD_oHekVRqLOAtBYtWX9JG9iTToXcQ6z-cZLMEYiGqrZikZgGUum8OhKX6pvLzBMz96TUpIXBxMYFkTyZkxyqNsjk72dvK4S-q5sN5rs6EmLwgo31SJhba7PGwkaS5t9CCDxChhET1EkSi4lXKP7GGQ8NbvayEN9mtAQ831pzMJc0kav46e3I4e0b97Pqn93UdXAhONkuTC68xeL-r1g4NrfQdrHz62QB-PjJuhIhAvciWaCaFtGTbVgULQH-1Js26mXAuwPiiiSlV6luG_t95ik2OPeaGQPq5qV3SDz0Lgyst9SjOsW6sQfLDF0LAgn-jh6e5n_2RVuMfwASPl0IJzSDeSCDGLuR5ja4vwKBchi6eE4whAb0Qmv4P3_K4-0Q_DjctGEslHpNspdhsUoTB7r0PPU6CM8FlX5zEv76UpsIIfJikyFCj3ZkkQL5WMJNz6PDx2mtGfeXrhcuDz1-z3I-bG5CQ8XeZZxl3O0GGPRiFFL9EZVq6ZajLz583ooJpIEbwlQ5bkQ4N4ZqP6PZFnIzjJWP5bsJVga6-PVNZjhVC1xq2_DnmZRaTseV5TMkVAiMHdNjc-tObMEbMIxKwEN3vv9Gl9Bpyo6bw0PHoIr20V9L8iyP6e4eXH-HAPE3AwFiEti5-kqSLY7oo6hsMPvpsz-S6FoH8V4j4roABtgV8KWxURIM5QzZLep11F-KCi8pSf1-sd4oWuWKhnIqjcE01gQZwyfsCc_brwW5nHNlxPliVmTKmheIz8njVdt4EKeJ_S2I05nQu49qi3A0l_vgoFNs4mmVMUTGqAUxbHUdETfjP6AEpMPVgEmyzkqp6HQwCz-Q=w1920-h870" alt="Wellbe" />
        </div>
        <div class="content">
          <h1 style="color: #040237;">You're Invited! Discover Your Workplace Wellbeing with Wellbe.</h1>
          <p>Dear ${emailContent.user},</p>
          <p>
            We are excited to invite you to participate in the <strong>Wellbeing Assessment</strong> through <strong>Wellbe</strong>, our innovative platform designed to support and enhance workplace wellbeing.
          </p>
          <p>This assessment will help you gain valuable insights into your overall wellbeing, allowing you to take proactive steps toward a healthier and more balanced work life. Your participation is completely confidential and will contribute to fostering a more supportive and positive work environment.</p>
          <p>Get started in just a few simple steps:</p>
          <ul>
            <li>Click the link below to access the Wellbe assessment.</li>
            <li>Answer a few quick questions about your workplace wellbeing.</li>
            <li>Receive personalized insights to help improve your experience.</li>
          </ul>
          <p><a href="${emailContent.link}" style="color: #040237;">Start Your Wellbeing Assessment</a></p>
          <p>Your wellbeing matters, and we’re here to support you every step of the way. If you have any questions, feel free to reach out.</p>
          <p>Looking forward to your participation!<p>
          <p>Best regards,</p>
          <p>The ${emailContent.company} Team</p>
        </div>
        <div class="footer">
          &copy; 2025 Wellbe: Your Wellbeing Buddy. All rights reserved.<br />
        </div>
      </div>
    </body>
    </html>`
    }

    private CHANGE_PASSWORD_EMAIL_TEMPLATE = (emailContent: EmailContent) => {
        return `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border: 1px solid #dddddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #040237;
          text-align: center;
          padding: 20px;
        }
        .header img {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px;
          color: #333333;
          line-height: 1.5;
        }
        .footer {
          background-color: #f1f1f1;
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://lh3.googleusercontent.com/fife/ALs6j_EhLAk44tlsWu-u6Vr0-clvo7ucOt2TTCGYoOaeZiQH1KeyMC0o7tfnT9Acq8TNu8mCXM8lmSZK0-f2jvtg1JwYOCzpZmC4nqdoAEAInqewBEY0R86XLE-GVMvErUK0B7LwTULKp4dFW8SCxASlHuYow0qIUhl5gMeckZmT7YT1vNuNTtKNYU_Xq2b_AiRi6tjBW22dYCdHr5MJjRu1oLiuYOz83nPpduvmcycQaxn1ugkqAihBfm9dyfsfLtvdU7xiz8S4Bwh5QMCWegyA8V0BPzPw_2gnjSupqG6OyPTDa2BocL5wD2R6D7c-TSVfZ1H5RKBCZFGlJRDBf_oVZ7Y2obdHv30g5YHO9LFTBCs5N0rCyUjj4AXoYUwDccsJVkLkuR28tmuYLNhgolHajsu551vXrAwZI4-FzCbXDQBdwe_hhk5z41RYxA8QtDNa74VvEXfnuVbowsOTHlfjyUTpCZSi2yAwA8MNcqGKupJw2EpxvZ3M5ck9ghr-kvQ8EAft1sCEJZJcMvQg8VBuK7ZjjuLpHJDLHJQU-TlLveXUki90YnuXOhQMIflAKK90bRDebNcH1tWcWvZTuLIkVEB5gZaDg2ywFevr9YpCZV6-tbBS3E33knh54mB1OMekdGAEB-abfUresNVBsOx4J8g2kLrPCgKuzSawxsCO057yQN2yhsnAG8IaCpfs9cTyhA5JFo7ib-0iIb9IaEDrmwpIvqn-fMH_0jq7LU2XALyG8a-tcxqF6MjLUC9bSokezkEkeOE2QSc7bShh0zzglqyNQN1VD4OC7x-JKlkX8T5iuzac_EYwh8-mFNFXczuRVQCDU4GC59dqLyv8dtASZTD_oHekVRqLOAtBYtWX9JG9iTToXcQ6z-cZLMEYiGqrZikZgGUum8OhKX6pvLzBMz96TUpIXBxMYFkTyZkxyqNsjk72dvK4S-q5sN5rs6EmLwgo31SJhba7PGwkaS5t9CCDxChhET1EkSi4lXKP7GGQ8NbvayEN9mtAQ831pzMJc0kav46e3I4e0b97Pqn93UdXAhONkuTC68xeL-r1g4NrfQdrHz62QB-PjJuhIhAvciWaCaFtGTbVgULQH-1Js26mXAuwPiiiSlV6luG_t95ik2OPeaGQPq5qV3SDz0Lgyst9SjOsW6sQfLDF0LAgn-jh6e5n_2RVuMfwASPl0IJzSDeSCDGLuR5ja4vwKBchi6eE4whAb0Qmv4P3_K4-0Q_DjctGEslHpNspdhsUoTB7r0PPU6CM8FlX5zEv76UpsIIfJikyFCj3ZkkQL5WMJNz6PDx2mtGfeXrhcuDz1-z3I-bG5CQ8XeZZxl3O0GGPRiFFL9EZVq6ZajLz583ooJpIEbwlQ5bkQ4N4ZqP6PZFnIzjJWP5bsJVga6-PVNZjhVC1xq2_DnmZRaTseV5TMkVAiMHdNjc-tObMEbMIxKwEN3vv9Gl9Bpyo6bw0PHoIr20V9L8iyP6e4eXH-HAPE3AwFiEti5-kqSLY7oo6hsMPvpsz-S6FoH8V4j4roABtgV8KWxURIM5QzZLep11F-KCi8pSf1-sd4oWuWKhnIqjcE01gQZwyfsCc_brwW5nHNlxPliVmTKmheIz8njVdt4EKeJ_S2I05nQu49qi3A0l_vgoFNs4mmVMUTGqAUxbHUdETfjP6AEpMPVgEmyzkqp6HQwCz-Q=w1920-h870" alt="Wellbe" />
        </div>
        <div class="content">
          <h1 style="color: #040237;">Password Reset Request</h1>
          <p>Hello ${emailContent.user},</p>
          <p>
            We are sending you this email because you requested a password reset. By clicking the link you will be redirected to the password reset page:
          </p>
          <a  href="${emailContent.link}">Reset your password.</a>
           <p>
            If you didn't request a password reset, you can ignore this email. Your password will not be changed.
          </p>
          <p>The Wellbe Team</p>
        </div>
        <div class="footer">
          &copy; 2025 Wellbe: Your Wellbeing Buddy. All rights reserved.<br />
        </div>
      </div>
    </body>
    </html>`
    }

    private REMINDER_INBOX_CONTENT = (emailContent: EmailContent) => {
        return `
    <div>
          <p>You have ${emailContent.left} sessions left to complete!</p>
          <p>Dear ${emailContent.user},</p>
          <p>
            We want to remind you that you have ${emailContent.left} more sessions pending that need your attention. Taking a moment to answer your current form will help you understand where you stand in terms of your mental well-being. By completing these sessions, you’ll gain valuable insights into how you’re feeling, identify areas of improvement, and receive personalized recommendations to support your overall health.
          </p>
          <p>Don’t wait—your well-being is important, and completing your forms is a key step in understanding how to better care for yourself. Answer your current form now, and continue your journey towards a healthier, more balanced state of mind.</p>
          <p>We’re here to support you every step of the way!</p>
          <p>Tap this <a href="https://employee-wellbe.vercel.app/" style="color: #040237;">link</a> to return to your Wellbe app and continue your journey to workplace wellbeing!</p>
          <p>If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #040237;">contact us</a>.</p>
          <p>Best regards,</p>
          <p>The ${emailContent.company} Team</p>
        </div>
    `
    }

    private START_INBOX_CONTENT = (emailContent: EmailContent) => {
        return `<div class="content">
          <p>Start your journey to a better you with WellBe – because your health matters!</p>
          <p>Dear ${emailContent.user},</p>
          <p>
              Your forms are ready to fill up! You can go to your app and start answering our WellBe questions. In order for you to receive personalized advice and monitor your well-being, please take a few minutes to complete the assessment. This will help us understand your current well-being status and provide you with the necessary support to enhance your well-being at work.
          </p>
          <p>Here's are the Benefits of Monitoring Your Wellbeing:</p>
          <ul>
              <li><strong>Early Detection:</strong> Identify signs of stress or anxiety before they escalate.</li>
              <li><strong>Improved Resilience:</strong> Build coping strategies to handle life's challenges.</li>
              <li><strong>Better Decision-Making:</strong> Make informed choices about self-care and seeking support.</li>
              <li><strong>Enhanced Relationships:</strong> Manage emotions for healthier personal and professional connections.</li>
              <li><strong>Increased Productivity:</strong> Stay focused and motivated, improving work performance.</li>
          </ul>
          <p>Tap this <a href="/" style="color:rgb(8, 1, 183);">link</a> to start your Wellbe journey!</p>
          <p>If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #040237;">contact us</a>.</p>
          <p>Best regards,</p>
          <p>The ${emailContent.company} Team</p>
      </div>`
    }


    @Process('send-email')
    async handleSendEmail(job: Job) {
        console.log(`Sending email to ${JSON.stringify(job.data)}`);
        const { to, subject, text, html } = job.data

        const emailContent = html
            ? { html }
            : { text: text ?? subject }

        try {
            const resendEmail = await this.resend.emails.send({
                from: this.configService.get('RESEND_FROM_EMAIL')!,
                to,
                subject,
                ...emailContent
            })
            Logger.log(`asdasd ${JSON.stringify(resendEmail)}`);
        } catch (error) {
            Logger.error(error)
            throw error
        }
    }

    @Process('send-bulk-email')
    async handleBulkEmail(job: Job<EmailData>) {
        const { emails, subject, html, text } = job.data

        const emailContent = html
            ? { html }
            : { text: text ?? subject }

        if (!Array.isArray(emails)) {
            throw new Error('Emails from job.data is not array')
        }

        const mappedEmails = emails.map((email) => ({
            from: this.configService.get('RESEND_FROM_EMAIL')!,
            to: email,
            subject,
            ...emailContent
        }))

        console.log(mappedEmails)

        // try {
        //     const sending = await this.resend.batch.send(mappedEmails)
        //     console.log(sending)
        //     return {
        //         success: true
        //     }
        // } catch (error) {
        //     Logger.log(error)
        //     throw error
        // }
    }

    // ================================================================

    @Process('send-single-invite')
    async handleSingleInvite(job: Job<EmailOptions>) {
        const { to, subject, content } = job.data
        const html = this['INVITE_EMAIL_TEMPLATE'](content)
        try {
            const resendEmail = await this.resend.emails.send({
                from: this.configService.get('RESEND_FROM_EMAIL')!,
                to,
                subject,
                html
            })
            Logger.log(`asdasd ${JSON.stringify(resendEmail)}`);
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }


    @Process('send-bulk-invite')
    async handleBulkInvite(job: Job<BulkUsers>) {
        const { subject, company, listOfUsers } = job.data

        const emailPayload = listOfUsers.map((user) => {
            const { email, first_name, last_name, department } = user
            const domain = this.configService.get<string>('INVITE_LINK')
            const link = `${domain}/sign-up?email=${email}&firstname=${first_name}&lastname=${last_name}&department=${department}&company=${company}`
            const to: string[] = []
            to.push(email)
            const html = this['INVITE_EMAIL_TEMPLATE']({ user: first_name, company, link })
            return {
                from: this.configService.get('RESEND_FROM_EMAIL')!,
                to,
                subject,
                html
            }
        })

        try {
            await this.resend.batch.send(emailPayload)
        } catch (error) {
            throw error
        }

    }
}