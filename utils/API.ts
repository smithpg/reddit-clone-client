type RequestOptions = {
  method?: string;
  body?: Record<string, unknown> | string;
  token?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
};

export default async function request(
  endpoint: string,
  options?: RequestOptions
): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  // Attach token as Authorization header, if one exists
  const token = window.localStorage.getItem('__legenda_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Build fetch config
  const config: RequestInit = {
    method: options?.method || (options?.body ? 'POST' : 'GET'),
    // credentials: 'include',
    redirect: 'follow',
    headers: {
      ...headers,
      ...options?.headers,
    },
  };

  if (options?.body) {
    config.body = JSON.stringify(options.body);
  }

  // Build the URL
  let URL = getFullPath(endpoint);
  if (options?.queryParams) {
    URL += generateQueryString(options.queryParams);
  }

  // Perform the fetch, parsing any JSON in the response
  return window.fetch(URL, config).then(async (response) => {
    if (response.status === 401) {
      // If the user's token was invalid
      // clearLocalAuthToken();

      // Refresh the page, to force reauthentication
      // window.location.assign(window.location);
      return;
    }

    // Extract data from the response
    const contentType = response.headers.get('Content-Type');
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text')) {
      data = await response.text();
    }

    if (response.ok) {
      return Promise.resolve(data);
    } else {
      return Promise.reject(data);
    }
  });
}

function getFullPath(subpath) {
  return `${process.env.NEXT_PUBLIC_API_URL}/${subpath}`;
}

function generateQueryString(queryParams) {
  const pairs = Object.entries(queryParams)
    .map(([key, val]) => {
      return `${key}=${val}`;
    })
    .join('&');
  return '?' + pairs;
}
