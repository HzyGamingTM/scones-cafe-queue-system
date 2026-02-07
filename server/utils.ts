export const isNumeric = (str: string): boolean => {
  return !isNaN(+str) && isFinite(+str);
};

export const emailAddrCheck: RegExp = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
