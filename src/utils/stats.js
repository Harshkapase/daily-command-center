// Number of completed goals
export const countDone = goals => goals.filter(g => g.done).length;

// Total calories across logged meals
export const sumCalories = meals => meals.reduce((s, m) => s + (Number(m.kcal) || 0), 0);
