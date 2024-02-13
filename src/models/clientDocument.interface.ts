export default interface IClientDocument {
    _id?: string
    email: string,
    full_name: string,
    company: string,
    website: string,
    notes: string,
    sent_emails?: string
}