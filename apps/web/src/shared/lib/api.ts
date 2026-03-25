export const apiFetch = async (url: string) => {
    return fetch(url).then(res => res.json());
};
