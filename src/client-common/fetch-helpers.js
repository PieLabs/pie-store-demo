export const status = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

export const json = (response) => response.json();

export const jsonHeaders = {
  'Content-Type': 'application/json',
  'Accepts': 'application/json'
};
