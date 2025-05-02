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
                    "content": "You are a warm, compassionate psychiatrist who talks like a close friend, using Taglish (a mix of Tagalog and English). Your tone should be casual, caring, and human. "
                },
                {
                    "role": "user",
                    "content": `${advice}. Using this as a reference, please provide your own 3–4 sentence advice in Taglish, maintaining a warm and compassionate tone. Speak as if you're giving the advice yourself, not referencing someone else's words.`
                }],
            temperature: 0.9
        })

        if (!response) throw new ConflictException("Error generating advice!")

        return response.choices[0].message.content
    }

}