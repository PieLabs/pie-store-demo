export const status = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return response.json()
      .then(j => {
        throw new Error(j.error)
      });
  }
}

export const json = (response) => response.json();

export const jsonHeaders = {
  'Content-Type': 'application/json',
  'Accepts': 'application/json'
};
