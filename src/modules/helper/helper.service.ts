import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserQuery } from 'src/types/user';
import * as bcrypt from 'bcrypt'
import { JwtPayload } from 'src/types/jwt-payload';
import { AnswerModel } from 'src/types/answer';
import { Exception } from 'handlebars';
import * as cuid from 'cuid';
import { resolve } from 'path';


@Injectable()
export class HelperService {
    constructor(private readonly prisma: PrismaService,
    ) { }

    async getCompany(company_name: string) {
        if (!company_name) throw new BadRequestException("Invalid Payload")
        const company = await this.prisma.company.findUnique({
            where: {
                name: company_name
            }
        })

        if (!company) throw new NotFoundException("Company doesn't exist")

        return company
    }

    async getUserByEmail(email: string) {
        const user = await this.prisma.employee.findFirst({
            where: {
                email
            }
        })
        if (!user) throw new NotFoundException("User doesn't exist")
        return user
    }

    async getDepartmentId(company_name: string, department_name: string) {
        if (!company_name || !department_name) throw new BadRequestException()

        const department = await this.prisma.department.findUnique({
            where: {
                name_company_id: {
                    name: department_name,
                    company_id: company_name,
                },
            },
        })

        if (!department) throw new NotFoundException("Department doesn't exist")

        return department.id
    }

    async getUserIdByEmail(user_data: JwtPayload) {

        const { sub, company } = user_data

        const userDetails = await this.prisma.employee.findUnique({
            where: {
                email: sub,
                department: {
                    company: {
                        name: company
                    }
                }
            },
            omit: {
                password: true,
                role: true
            },
            include: {
                department: {
                    select: {
                        name: true,
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
        })

        if (!userDetails) throw new NotFoundException(`User with the email of ${sub} does not exist!`)

        return userDetails
    }

    async generateBatchQuestions() {
        try {
            const questions = await this.prisma.question.findMany({
                select: {
                    id: true,
                    domain: true
                }
            });

            // Categorize questions by domain
            const domainMap: { [key: string]: number[] } = {
                character: [],
                career: [],
                connectedness: [],
                contentment: []
            };

            questions.forEach(({ id, domain }) => {
                if (domainMap[domain]) {
                    domainMap[domain].push(id);
                }
            });

            // Shuffle function
            function shuffleArray<T>(array: T[]): T[] {
                const arr = [...array];
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            }

            // Shuffle each domain
            for (const domain in domainMap) {
                domainMap[domain] = shuffleArray(domainMap[domain]);
            }

            // Initialize 5 empty sets
            const sets: number[][] = Array.from({ length: 5 }, () => []);

            // Assign one question from each domain to each set
            for (let i = 0; i < 5; i++) {
                for (const domain in domainMap) {
                    const question = domainMap[domain].pop();
                    if (question !== undefined) {
                        sets[i].push(question);
                    }
                }
            }

            // Collect remaining questions
            const remainingQuestions = Object.values(domainMap).flat();

            // Distribute remaining questions to complete each set with 5 questions
            let setIndex = 0;
            for (const question of remainingQuestions) {
                if (sets[setIndex].length < 5) {
                    sets[setIndex].push(question);
                    setIndex = (setIndex + 1) % 5;
                }
            }

            return sets;
        } catch (error) {
            Logger.error('Error generating batch questions:', error);
            return {
                message: "There's an error while generating the questions."
            };
        }
    }

    async getBatch(company_name: string) {
        const company_record = await this.prisma.batch_Record.findMany({
            where: {
                company_name
            }
        })
        return company_record
    }

    async isReadyToReleaseNewBatch(company_name: string) {
        const company_record = await this.prisma.batch_Record.findFirst({
            where: {
                company_name
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!company_record) return true

        if (company_record?.is_completed === false) return false

        return true
    }

    async getCurrentSet(company_name: string) {
        const current_set = await this.prisma.batch_Record.findFirst({
            where: {
                company_name
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!current_set) throw new NotFoundException('No Batch Available!')

        return current_set?.current_set_number
    }

    async getLatestBatch(company_name: string) {
        const latest_batch = await this.prisma.batch_Record.findFirst({
            where: {
                company_name
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!latest_batch) throw new NotFoundException("No available batch")

        return latest_batch
    }

    async hashPass(password: string) {
        return await bcrypt.hash(password, 10)
    }

    async comparePass(password: string, hashed_pass: string) {
        return await bcrypt.compare(password, hashed_pass)
    }

    async transformString(text: string) {
        return text.toLowerCase().replace(' ', '-')
    }

    async getCompanyConfig(name: string) {
        const setting = await this.prisma.settings.findFirst({
            where: {
                config_id: name
            }
        })
        if (!setting) throw new NotFoundException(`No setting found for ${name} company`)
        return setting
    }

    async getDepartmentIdByUserEmail(email: string) {
        const employee = await this.prisma.employee.findUnique({
            where: {
                email
            },
        })
        if (!employee) throw new NotFoundException("User not Found")
        return employee.department_id
    }

    async getDepartment(company: string, department: string) {
        const department_details = await this.prisma.department.findFirst({
            where: {
                company_id: company,
                name: department
            }
        })

        if (!department_details) throw new NotFoundException("Department not Found!")

        return department_details
    }

    async userCompletedTheBatch(email: string, batch_id: string) {

        const payload = {
            email_batch_id: {
                email,
                batch_id
            }
        }

        const employee_batch_data = await this.prisma.employee_Under_Batch.findUnique({
            where: payload
        })

        if (!employee_batch_data) throw new NotFoundException("User doens't belong to the batch!")

        if (Array.isArray(employee_batch_data.set_participation)) {
            const completed = [...employee_batch_data.set_participation].includes(false)

            await this.prisma.employee_Under_Batch.update({
                where: payload,
                data: {
                    is_completed: !completed
                }
            })
        }
    }

    async getExistingAdvice(sub_domain: string, score: number) {

        const user_score = score == 4 ? "above_average" : score == 3 ? "average" : score == 2 ? "below_average" : score == 1 ? "low" : ""
        const advice = await this.prisma.advice.findFirst({
            where: {
                sub_domain
            },
        })

        if (!advice) throw new NotFoundException("Advice not Found!")

        return advice[user_score]
    }

    async getAdviceForUser(data: AnswerModel[]) {

        const advices: string[] = []

        for (const obj of data) {
            const [key, value] = Object.entries(obj)[0]
            const question = await this.prisma.question.findUnique({
                where: {
                    id: Number(key)
                }
            })
            if (!question) throw new NotFoundException("Question not Found!")

            const advice = await this.getExistingAdvice(question.subdomain, value)
            advices.push(advice)
        }
        return advices.join(" ")
    }

    getCurrentDate() {
        const date = new Date
        date.setHours(date.getHours() + 8)
        return date
    }

    async getBatchTips(batch_id: string, user: string) {

        const tips_bank: string[] = []

        const tips = await this.prisma.tips.findMany({
            where: {
                user,
                batch_created: batch_id
            },
            select: {
                tip: true
            }
        })

        if (!tips) throw new NotFoundException("Tips not Found!")

        for (const obj of tips) {
            const [key, value] = Object.entries(obj)[0]
            tips_bank.push(value)
        }

        return tips_bank.join(" ")
    }

    async getNotFinished() {
        const companies = await this.prisma.batch_Record.findMany({
            where: {
                is_completed: false
            },
            select: {
                company_name: true,
                employees_under_batch: {
                    select: {
                        email: true
                    }
                },
                frequency: true
            }
        })

        if (!companies) throw new Exception("No Companies")

        const company_data = companies.map(({ company_name, employees_under_batch, frequency }) => ({
            company: company_name,
            frequency,
            emails: employees_under_batch.map(emp => emp.email),
        }))

        return company_data
    }

    getPeriod(period?: string) {
        if (!period) return undefined
        const data_period = period == "quarter" ? 3 : period == "semiannual" ? 6 : period == "annual" ? 12 : 0
        const date = new Date()
        const XMonthsAgo = new Date(date)
        XMonthsAgo.setMonth(XMonthsAgo.getMonth() - data_period)
        return XMonthsAgo
    }

    async saveToInbox(subject: string, receiver: string, body: string, tag: string) {
        const newInbox = await this.prisma.inbox.create({
            data: {
                subject,
                receiver,
                body,
                tag,
                created_at: this.getCurrentDate()
            }
        })
        if (!newInbox) throw new ConflictException("Error Saving Message!")

        return newInbox
    }

    async getQuestionById(id: number) {
        const question = await this.prisma.question.findFirst({
            where: {
                id
            },
            omit: {
                subdomain: true,
                is_flipped: true,
            }
        })
        if (!question) throw new NotFoundException("Question not Found!")
        return question
    }

    getReminderFormat(user: string, left: string, company: string, link: string) {
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
                    <p>Tap this <a href="${link}" style="color: #040237;">link</a> to return to your Wellbe app and continue your journey to workplace wellbeing!</p>
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


    getInviteFormat(user: string, link: string, company: string) {
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

    getForgotPassword(user: string, link: string) {
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
          <p>Hello ${user},</p>
          <p>
            We are sending you this email because you requested a password reset. By clicking the link you will be redirected to the password reset page:
          </p>
          <a  href="${link}">Reset your password.</a>
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

    getStartBatch(user: string, company: string, link: string) {
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
                        <p>Tap this <a href=${link} style="color: #040237;">link</a> to start your Wellbe journey!</p>
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

}