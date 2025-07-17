import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { ConflictError } from 'openai';

@Injectable()
export class OpenaiService {

    private readonly openAI: OpenAI

    constructor(private readonly configService: ConfigService) {
        this.openAI = new OpenAI({
            apiKey: this.configService.get<string>("OPENAI_API_KEY")
        })
    }

    async generateTip(advice: string) {
        const response = await this.openAI.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    "role": "system",
                    "content": "You are a warm, compassionate psychiatrist who talks like a close friend, using Taglish (a mix of Tagalog and English). Your tone should be casual, caring, and human."
                },
                {
                    "role": "user",
                    "content": `${advice}. Using this as a reference, please provide your own 3–4 sentence advice in Taglish, maintaining a warm and compassionate tone. Speak as if you're giving the advice yourself, not referencing someone else's words. Praise if the wellbeing is high and Motivate if it's low.`
                }],
            temperature: 0.9
        })

        if (!response) throw new ConflictException("Error generating advice!")

        return response.choices[0].message.content
    }

    async generateHolisticTip(advice: string, wellbeing) {
        const response = await this.openAI.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    "role": "system",
                    "content": "You are a warm, compassionate psychiatrist who talks like a close friend, using Taglish (a mix of Tagalog and English). Your tone should be casual, caring, and human. When provided with multiple tips and well-being scores, synthesize them into one holistic recommendation. Respond with: 1) A 2-sentenced encouraging/motivating intro . 2) Four bullet points labeled Character, Career, Contentment, and Connectedness. 3). A quote that motivates the user."
                },
                {
                    "role": "user",
                    "content": `Previous tips: ${advice}. Wellbeing scores: ${wellbeing} Using the previous tips and the wellbeing score, generate a holistic tip following the format. Make sure not to mention the wellbeing scores, just praise or motivate if it's high or low. Return the result as an object in this format: {feedback, character, career, connectedness,contentment, quote}`
                }],
            temperature: 0.9
        })

        if (!response) throw new ConflictException("Error generating advice!")

        return response.choices[0].message.content
    }
}