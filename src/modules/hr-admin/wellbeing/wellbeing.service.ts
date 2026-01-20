import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NewAnswerModel } from 'src/types/answer';
import { JwtPayload } from 'src/types/jwt-payload';
import { DomainWellbeing, Score } from 'src/types/wellbeing';

@Injectable()
export class WellbeingService {
  private logger = new Logger(WellbeingService.name);

  constructor(
    private readonly helper: HelperService,
    private readonly prisma: PrismaService,
  ) {}

  private compute(rawScore: number, domain: string) {
    const maxScore = {
      character: 28,
      career: 28,
      contentment: 24,
      connectedness: 20,
    };

    return Math.floor((rawScore / maxScore[domain]) * 100);
  }

  async generateUserWellbeing(user: JwtPayload) {
    try {
      const start = new Date();
      start.setHours(start.getHours() + 8);

      const { company, sub } = user;

      const latest_batch = await this.helper.getLatestBatch(company);

      const employee_data = await this.prisma.employee.findUnique({
        where: {
          email: sub,
        },
      });

      const user_batch_data = await this.prisma.employee_Under_Batch.findFirst({
        where: {
          email: sub,
          batch_id: latest_batch.id,
        },
      });

      if (!employee_data) throw new NotFoundException('User not Found!');
      if (!user_batch_data) throw new NotFoundException('No Batch Available!');
      if (user_batch_data.is_completed === false)
        throw new ConflictException(
          'Incomplete user data. Cannot generate Report!',
        );

      const user_answers = (await this.prisma.answer.findMany({
        where: {
          employee_id: user_batch_data.id,
        },
        select: {
          answer: true,
        },
      })) as NewAnswerModel[];

      if (user_answers.length === 0) {
        throw new NotFoundException('No answers found for this employee!');
      }

      const flatMappedAnswers = user_answers.flatMap(
        (answerRecord) => answerRecord.answer,
      );

      const domainScores: Score = {
        character: 0,
        career: 0,
        connectedness: 0,
        contentment: 0,
      };

      const categoryMap: Record<string, keyof Score> = {
        '1': 'character',
        '2': 'career',
        '3': 'contentment',
        '4': 'connectedness',
      };

      flatMappedAnswers.forEach((answerData) => {
        const [[key, value]] = Object.entries(answerData);
        const category = key.charAt(0);
        const domain = categoryMap[category];
        if (domain) domainScores[domain] += value;
      });

      const [
        maxCharacterScore,
        maxCareerScore,
        maxConnectednessScore,
        maxContentmentScore,
      ] = await Promise.all([
        this.prisma.question.count({
          where: {
            domain: 'character',
          },
        }),
        this.prisma.question.count({
          where: {
            domain: 'career',
          },
        }),
        this.prisma.question.count({
          where: {
            domain: 'connectedness',
          },
        }),
        this.prisma.question.count({
          where: {
            domain: 'contentment',
          },
        }),
      ]);

      const wellbeing_score = {
        character: domainScores.character,
        career: domainScores.career,
        connectedness: domainScores.connectedness,
        contentment: domainScores.contentment,
      };

      const wellbeing = await this.prisma.wellbeing.create({
        data: {
          user_email: user_batch_data.email,
          created_at: start,
          wellbeing_score,
          batch_id: latest_batch.id,
          department: employee_data.department_id,
        },
      });

      if (!wellbeing) throw new ConflictException('Error saving score!');

      return { message: 'Successful wellbeing score generation!' };
    } catch (error) {
      Logger.log(error, 'ERROR LOG IN WELLBEING');
      if (error.code === 'P2002')
        throw new ConflictException('Wellbeing already generated!');
    }
  }

  async getUserWellbeing(user_details: JwtPayload) {
    const { sub } = user_details;

    const user = await this.helper.getUserByEmail(sub);

    const scores = await this.prisma.wellbeing.findFirst({
      where: {
        user_email: user.email,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const score = scores as unknown as {
      user_email: string;
      created_at: string;
      wellbeing_score: {
        career: number;
        character: number;
        contentment: number;
        connectedness: number;
      };
      department: string;
      batch_id: string;
      id: string;
    };

    if (!score) throw new NotFoundException('Score not found!');

    const result: { score: number; scoreband: string; domain: string }[] = [];

    const { wellbeing_score } = score;

    for (const domain in wellbeing_score) {
      const scoreband = this.getStanine(wellbeing_score[domain], domain);
      result.push({
        domain,
        scoreband,
        score: this.compute(wellbeing_score[domain], domain),
      });
    }
    return result;
  }

  async getCompanyWellbeing(user_details: JwtPayload, period?: string) {
    const company = await this.helper.getCompany(user_details.company);
    const latest_batch = await this.helper.getLatestBatch(company.name);

    const eub = await this.prisma.employee_Under_Batch.findMany({
      where: {
        batch_id: latest_batch.id,
        is_completed: true,
      },
      select: {
        id: true,
      },
    });

    if (!eub) throw new ConflictException('No user under batch!');

    const flatEub = eub.flatMap((item) => item.id);

    const individual_answers = await this.prisma.answer.findMany({
      where: {
        employee_id: {
          in: flatEub,
        },
      },

      select: {
        answer: true,
      },
    });

    if (!individual_answers)
      throw new ConflictException('Error generating Individual Answers!');

    const aggregates = this.getSumofAllAnswers(
      individual_answers as { answer: { [key: string]: number }[] }[],
    );

    const aggregatedData = this.aggregateData(aggregates, flatEub.length);

    return {
      character: this.compute(Number(aggregatedData.character), 'character'),
      career: this.compute(Number(aggregatedData.career), 'career'),
      connectedness: this.compute(
        Number(aggregatedData.connectedness),
        'connectedness',
      ),
      contentment: this.compute(
        Number(aggregatedData.contentment),
        'contentment',
      ),
    };
  }

  async getDepartmentWellbeing(user_details: JwtPayload, period?: string) {
    const company = await this.helper.getCompany(user_details.company);

    const month = this.helper.getPeriod(period);

    const deptWellbeing = await this.prisma.department.findMany({
      where: {
        company_id: company.name,
      },
      select: {
        name: true,
        Wellbeing: {
          where: {
            created_at: {
              gte: month,
            },
          },
          select: {
            wellbeing_score: true,
          },
        },
      },
    });

    return deptWellbeing.map(({ name, Wellbeing }) => {
      if (Wellbeing.length === 0) {
        return { name, average_Wellbeing: null, wellbeing: null };
      }

      const scores = Wellbeing.map(
        (w) => w.wellbeing_score as Record<string, number>,
      );

      const keys = Object.keys(scores[0]);

      const average_Wellbeing = keys.reduce(
        (acc, key) => {
          const total = scores.reduce((sum, s) => sum + (s[key] ?? 0), 0);
          acc[key] = Math.floor(total / scores.length);
          return acc;
        },
        {} as Record<string, number>,
      );

      const sumOfAverages = keys.reduce(
        (sum, key) => sum + average_Wellbeing[key],
        0,
      );
      const wellbeing = Math.floor(sumOfAverages / keys.length);

      return { name, average_Wellbeing, wellbeing };
    });
  }

  private getAverage(data: Score, count: number) {
    const career = Math.floor(data.career / count);
    const character = Math.floor(data.character / count);
    const contentment = Math.floor(data.contentment / count);
    const connectedness = Math.floor(data.connectedness / count);

    const wellbe = Math.floor(career + character + contentment + connectedness);

    return {
      career: this.compute(career, 'career'),
      character: this.compute(character, 'character'),
      contentment: this.compute(contentment, 'contentment'),
      connectedness: this.compute(connectedness, 'connectedness'),
      wellbe,
    };
  }

  async getComputedDomain(user_details: JwtPayload, period?: string) {
    const company = await this.helper.getCompany(user_details.company);
    const month = this.helper.getPeriod(period);

    // Fetch all data in a single optimized query with proper joins
    const batches = await this.prisma.batch_Record.findMany({
      where: {
        company_name: company.name,
        created_at: {
          gte: month,
        },
        is_completed: true,
      },
      orderBy: {
        created_at: 'asc',
      },
      select: {
        id: true,
        created_at: true,
        employees_under_batch: {
          where: {
            is_completed: true,
          },
          select: {
            id: true,
            Answer: {
              select: {
                answer: true,
              },
            },
          },
        },
      },
    });
    // Process results without additional database queries
    const result = batches.map(({ id, created_at, employees_under_batch }) => {
      if (!employees_under_batch.length) {
        return {
          wellbeing: 0,
          created_at,
        };
      }

      // Flatten all answers from all employees in this batch
      const allAnswers = employees_under_batch.flatMap(
        (employee) => employee.Answer,
      );

      if (!allAnswers.length) {
        throw new ConflictException('Error generating Individual Answers!');
      }

      // Calculate aggregates
      const aggregates = this.getSumofAllAnswers(
        allAnswers as { answer: { [key: string]: number }[] }[],
      );

      const wellbeingData = this.aggregateData(
        aggregates,
        employees_under_batch.length,
      );

      return {
        wellbeing: Math.floor(
          Number(
            Number(wellbeingData.character) +
              Number(wellbeingData.career) +
              Number(wellbeingData.connectedness) +
              Number(wellbeingData.contentment),
          ),
        ),
        created_at,
      };
    });

    console.log(result);
    return result;
  }

  async getDomainInsight(user_details: JwtPayload) {
    const company = await this.helper.getCompany(user_details.company);
    const latest_batch = await this.helper.getLatestBatch(company.name);

    // Fetch employees with their answers in a single query
    const employees = await this.prisma.employee_Under_Batch.findMany({
      where: {
        batch_id: latest_batch.id,
        is_completed: true,
      },
      select: {
        id: true,
        Answer: {
          select: {
            answer: true,
          },
        },
      },
    });

    if (!employees.length) {
      throw new ConflictException('No user under batch!');
    }

    // Flatten all answers
    const allAnswers = employees.flatMap((employee) => employee.Answer);

    if (!allAnswers.length) {
      throw new ConflictException('Error generating Individual Answers!');
    }

    const aggregates = this.getSumofAllAnswers(
      allAnswers as { answer: { [key: string]: number }[] }[],
    );

    const wellbeing = this.aggregateData(aggregates, employees.length);

    const domainNameMap = {
      character: 'CHARACTER',
      career: 'CAREER',
      connectedness: 'CONNECTEDNESS',
      contentment: 'CONTENTMENT',
    };

    const stanineToScoreBandMap = {
      High: 'VERY_HIGH',
      'Above Average': 'ABOVE_AVERAGE',
      Average: 'AVERAGE',
      'Below Average': 'BELOW_AVERAGE',
      Low: 'VERY_LOW',
    };

    // Collect all domain insights needed in a single query
    const domainQueries = Object.keys(wellbeing).map((domain) => {
      const average = wellbeing[domain];
      const stanineLabel = this.getStanine(average, domain);
      const scoreBand = stanineToScoreBandMap[stanineLabel];

      return {
        domain: domainNameMap[domain],
        score_band: scoreBand,
      };
    });

    // Fetch all domain interpretations in one query using OR conditions
    const domainInsights = await this.prisma.domainInterpretation.findMany({
      where: {
        OR: domainQueries.map(({ domain, score_band }) => ({
          domain,
          score_band,
        })),
      },
    });

    // Create a lookup map for O(1) access
    const insightMap = new Map(
      domainInsights.map((insight) => [
        `${insight.domain}_${insight.score_band}`,
        insight,
      ]),
    );

    // Build result array
    const result: DomainWellbeing[] = Object.keys(wellbeing).map((domain) => {
      const average = wellbeing[domain];
      const stanineLabel = this.getStanine(average, domain);
      const scoreBand = stanineToScoreBandMap[stanineLabel];
      const domainName = domainNameMap[domain];

      const domainInsight = insightMap.get(`${domainName}_${scoreBand}`);

      if (!domainInsight) {
        throw new ConflictException(
          `No Insight for ${domainName} - ${scoreBand}`,
        );
      }

      return {
        domain,
        stanine_score: this.compute(average, domain),
        stanine_label: stanineLabel,
        insight: domainInsight.insight,
        to_do: domainInsight.what_to_build_on,
      };
    });

    return result;
  }

  private aggregateData(
    aggregates: {
      [x: string]: number;
    }[],
    eubCount: number,
  ) {
    const aggregatesResult = {
      character: 0,
      career: 0,
      contentment: 0,
      connectedness: 0,
    };

    aggregates.forEach((obj) => {
      const key = Object.keys(obj)[0];
      const value = obj[key];
      const prefix = key.charAt(0);

      switch (prefix) {
        case '1':
          aggregatesResult.character += value;
          break;
        case '2':
          aggregatesResult.career += value;
          break;
        case '3':
          aggregatesResult.contentment += value;
          break;
        case '4':
          aggregatesResult.connectedness += value;
          break;
      }
    });

    return {
      character: (aggregatesResult.character / eubCount).toFixed(2),
      career: (aggregatesResult.career / eubCount).toFixed(2),
      connectedness: (aggregatesResult.connectedness / eubCount).toFixed(2),
      contentment: (aggregatesResult.contentment / eubCount).toFixed(2),
    };
  }

  private getSumofAllAnswers(data: { answer: { [key: string]: number }[] }[]) {
    const sumMap = {};

    // Iterate through each item
    data.forEach((item) => {
      // Iterate through each answer object in the answer array
      item.answer.forEach((answerObj) => {
        // Get the key and value from the object
        const key = Object.keys(answerObj)[0];
        const value = answerObj[key];

        // Add to existing sum or initialize
        if (sumMap[key]) {
          sumMap[key] += value;
        } else {
          sumMap[key] = value;
        }
      });
    });

    // Convert the map back to array of objects
    const result = Object.keys(sumMap).map((key) => ({
      [key]: sumMap[key],
    }));

    return result;
  }

  private getStanine(rawValue: number, domain: string) {
    const value = Math.floor(rawValue);

    switch (domain) {
      case 'character':
        return value > 26
          ? 'Above Average'
          : value <= 26 && value >= 21
            ? 'Average'
            : value == 20
              ? 'Below Average'
              : value <= 19
                ? 'Low'
                : 'Invalid Label';

      case 'career':
        return value > 26
          ? 'Above Average'
          : value <= 26 && value >= 21
            ? 'Average'
            : value == 20
              ? 'Below Average'
              : value <= 19
                ? 'Low'
                : 'Invalid Label';

      case 'connectedness':
        return value == 20
          ? 'High'
          : value <= 19 && value >= 18
            ? 'Above Average'
            : value <= 17 && value >= 13
              ? 'Average'
              : value <= 12 && value >= 11
                ? 'Below Average'
                : value < 11
                  ? 'Low'
                  : 'Invalid Label';

      case 'contentment':
        return value >= 21
          ? 'High'
          : value <= 20 && value >= 19
            ? 'Above Average'
            : value <= 18 && value >= 13
              ? 'Average'
              : value <= 12 && value >= 10
                ? 'Below Average'
                : value <= 9
                  ? 'Low'
                  : 'Invalid Label';
      default:
        return 'Invalid Domain';
    }
  }

  async getCompanyOverallWellbeing(user_details: JwtPayload, period?: string) {
    const company = await this.helper.getCompany(user_details.company);
    const month = this.helper.getPeriod(period);

    const batches = await this.prisma.batch_Record.findMany({
      where: {
        company_name: company.name,
        created_at: {
          gte: month,
        },
        is_completed: true,
      },
      orderBy: {
        created_at: 'asc',
      },
      select: {
        id: true,
        created_at: true,
        employees_under_batch: {
          where: {
            is_completed: true,
          },
          select: {
            id: true,
            Answer: {
              select: {
                answer: true,
              },
            },
          },
        },
      },
    });

    const result = batches.map(({ id, created_at, employees_under_batch }) => {
      if (!employees_under_batch.length) {
        return 0;
      }

      // Flatten all answers from all employees in this batch
      const allAnswers = employees_under_batch.flatMap(
        (employee) => employee.Answer,
      );

      if (!allAnswers.length) {
        throw new ConflictException('Error generating Individual Answers!');
      }

      // Calculate aggregates
      const aggregates = this.getSumofAllAnswers(
        allAnswers as { answer: { [key: string]: number }[] }[],
      );

      const wellbeingData = this.aggregateData(
        aggregates,
        employees_under_batch.length,
      );

      return (
        Number(wellbeingData.character) +
        Number(wellbeingData.career) +
        Number(wellbeingData.connectedness) +
        Number(wellbeingData.contentment)
      );
    });

    const total = result.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    return {
      overall_wellbeing_label: this.getOverAllWellbeingLabel(
        total / result.length,
      ),
    };
  }

  private getOverAllWellbeingLabel(score: number) {
    const v = Math.floor(score);
    console.log(v);

    return v > 95
      ? 'Very High'
      : v <= 94 && v >= 90
        ? 'Above Average'
        : v <= 89 && v >= 74
          ? 'Average'
          : v <= 73 && v >= 64
            ? 'Below Average'
            : 'Very Low';
  }
}
