import { EmailContent } from "./email";

interface InviteResult {
    successInvites: Array<{ item: InviteItem }>;
    failedInvites: Array<{ item: InviteItem; missingFields: string[] }>;
}

export type InviteItem = {
    email: string;
    first_name: string;
    last_name: string;
    department: string;
};


export type InviteData = {
    email: string;
    first_name: string;
    last_name: string;
    department: string;
}

export type EmailOptions = {
    to: string
    subject: string
    content: EmailContent
}

export type BulkUsers = {
    subject: string
    company: string
    listOfUsers: InviteData[]
}