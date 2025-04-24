export interface EmailPayload {
    company: string
    user: string
}

export interface MailerPayload extends EmailPayload {
    to: string
    subject: string
}

export interface ReminderEmail {
    to: string
    left: number
}



export interface BaseEmailFormat {
    company: string,
    user: string,
    to: string,
    subject: string
}

export interface EmailerReminder extends BaseEmailFormat {
    left: number
}

interface BaseData {
    company: string;
    user: string;
}

export interface Welcome {
    data: BaseData;
}

export interface Reminder {
    data: BaseData & { left: number };
}

export interface Deadline {
    data: BaseData;
}

export interface Invite {
    data: BaseData & { link: string };
}
