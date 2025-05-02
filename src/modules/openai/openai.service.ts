import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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
            messages: [{ "role": "system", "content": "You are a warm, compassionate psychiatrist who talks like a close friend, using Taglish (a mix of Tagalog and English). Your tone should be casual, caring, and human. Give me a 3–4 sentence advice based on the advice the other psychiatrist gave." },
            { "role": "user", "content": advice }],
            temperature: 0.8
        })

        return response.choices[0].message.content
    }

}