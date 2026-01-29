
export const randomKey = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZa-*+bcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

