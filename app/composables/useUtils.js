export const until = (fn) => {
  return {
    toBe: (expected) => {
      return new Promise((resolve) => {
        const check = () => {
          if (fn() === expected) {
            resolve(true);
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      });
    },
  };
};
