interface InviteResult {
    successInvites: Array<{ item: InviteItem }>;
    failedInvites: Array<{ item: InviteItem; missingFields: string[] }>;
}

type InviteItem = {
    email: string;
    first_name: string;
    last_name: string;
    department: string;
};