export const getNYDate = (): Date => {
    const nyString = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    return new Date(nyString);
};

export const formatNYDateString = (): string => {
    const d = getNYDate();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
