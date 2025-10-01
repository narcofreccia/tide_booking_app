export const isAdmin = (user) => {
  return ['admin'].includes(user?.role);
};

export const isEmployee = (user) => {
  return ['employee'].includes(user?.role);
};

export const isManager = (user) => {
  return ['manager'].includes(user?.role);
};

export const isOwner = (user) => {
  return ['owner'].includes(user?.role);
};

export const isUser = (user) => {
  return ['user'].includes(user?.role);
};

export const isRoot = (user) => {
  // For React Native/Expo, use process.env or expo-constants
  // You can set this in app.json under "extra" or use a config file
  const ROOT_USER = process.env.ROOT_USER || null;
  return user?.email === ROOT_USER;
};
  


  