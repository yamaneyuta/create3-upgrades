import crypto from 'crypto';

export const md5 = (input: string) => {
    const hash = crypto.createHash('md5');
    return hash.update(input).digest("hex");
}