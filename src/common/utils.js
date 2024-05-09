export function checkPermission(roles, acceptedRole) {
  return roles.includes(acceptedRole)
}

export function objectToQueryString(filter) {
  const keyValuePairs = [];
  for (const key in filter) {
    if (filter.hasOwnProperty(key)) {
      const value = filter[key];
      if (Array.isArray(value)) {
        value.forEach(val => {
          keyValuePairs.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(val)}`);
        });
      } else {
        keyValuePairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
  }
  return keyValuePairs.join('&');
}
