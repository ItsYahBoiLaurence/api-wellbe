import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class EmailerService {

  constructor(private readonly mailerService: MailerService,
  ) { }

  private welcomeTemplate = ({ user, company }: { user: string, company: string }) => {
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
                        <p>Dear ${user},</p>
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
                        <p>Tap this <a href="http://localhost:3400/" style="color: #040237;">link</a> to start your Wellbe journey!</p>
                        <p>If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #040237;">contact us</a>.</p>
                        <p>Best regards,</p>
                        <p>The ${company} Team</p>
                    </div>
                    <div class="footer">
                        &copy; 2025 Wellbe: Your Wellbeing Buddy. All rights reserved.<br/>
                    </div>
                </div>
            </body>
    </html>`
  }

  private reminderTemplate = ({ left, user, company }: { left: string, user: string, company: string }) => {
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
          <h1 style="color: #040237;">You have ${left} sessions left to complete!</h1>
          <p>Dear ${user},</p>
          <p>
            We want to remind you that you have ${left} more sessions pending that need your attention. Taking a moment to answer your current form will help you understand where you stand in terms of your mental well-being. By completing these sessions, you’ll gain valuable insights into how you’re feeling, identify areas of improvement, and receive personalized recommendations to support your overall health.
          </p>
          <p>Don’t wait—your well-being is important, and completing your forms is a key step in understanding how to better care for yourself. Answer your current form now, and continue your journey towards a healthier, more balanced state of mind.</p>
          <p>We’re here to support you every step of the way!</p>
          <p>Tap this <a href="https://localhost:3400/" style="color: #040237;">link</a> to return to your Wellbe app and continue your journey to workplace wellbeing!</p>
          <p>If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #040237;">contact us</a>.</p>
          <p>Best regards,</p>
          <p>The ${company} Team</p>
        </div>
        <div class="footer">
          &copy; 2025 Wellbe: Your Wellbeing Buddy. All rights reserved.<br/>
        </div>
      </div>
    </body>
    </html>`
  }

  private deadlineTemplate = ({ user, company }: { user: string, company: string }) => {
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
          <h1 style="color: #040237;">Reminder: Deadline Approaching!</h1>
          <p>Dear ${user},</p>
          <p>
            You have one week to complete your pending batch of questions. The deadline is fast approaching, and we encourage you to fill out your current form as soon as possible. By doing so, you’ll gain insights into your mental well-being and take an important step toward a healthier, more balanced state of mind.
          </p>
          <p>Don't miss out! Completing your forms will allow us to provide you with tailored advice and resources to support your well-being. Remember, the deadline is just around the corner, so take action now.</p>
          <p>We’re here to support you every step of the way!</p>
          <p>Tap this <a href="http://localhost:3400/" style="color: #040237;">link</a> to return to your Wellbe app and continue your journey to workplace wellbeing!</p>
          <p>If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #040237;">contact us</a>.</p>
          <p>Best regards,</p>
          <p>The ${company} Team</p>
        </div>
        <div class="footer">
          &copy; 2025 Wellbe: Your Wellbeing Buddy. All rights reserved.<br/>
        </div>
      </div>
    </body>
    </html>`
  }

  private inviteTemplate = ({ user, company, link }: { user: string, company: string, link: string }) => {
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
          <p>Dear ${user},</p>
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
          <p><a href="${link}" style="color: #040237;">Start Your Wellbeing Assessment</a></p>
          <p>Your wellbeing matters, and we’re here to support you every step of the way. If you have any questions, feel free to reach out.</p>
          <p>Looking forward to your participation!<p>
          <p>Best regards,</p>
          <p>The ${company} Team</p>
        </div>
        <div class="footer">
          &copy; 2025 Wellbe: Your Wellbeing Buddy. All rights reserved.<br />
        </div>
      </div>
    </body>
    </html>`
  }

  async welcomeEmail(email_data: { to: string, subject: string, company: string, user: string }) {
    if (!email_data) throw new NotFoundException("Email not found!")
    const { to, subject, company, user } = email_data
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html: this.welcomeTemplate({ company, user })
      })
    } catch (error) {
      Logger.log(error)
    }
  }
  //batch reminder email
  async reminderEmail(email_data: { to: string, subject: string, company: string, user: string, left: string }) {
    if (!email_data) throw new NotFoundException("Email not found!")
    const { to, subject, company, user, left } = email_data
    await this.mailerService.sendMail({
      to,
      subject,
      html: this.reminderTemplate({ company, user, left })
    })
  }
  //deadline reminder email
  async deadlineEmail() { }

  async inviteEmployee(user: string, email: string, company: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: "You're Invited",
        html: this.inviteTemplate({ user, company, link })
      })
    } catch (e) {
      Logger.log(e)
    }
  }
}
