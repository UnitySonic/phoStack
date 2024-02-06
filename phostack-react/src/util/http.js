import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const callExternalApi = async (options) => {
  try {
    const response = await fetch(options.config.url, options.config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || response.statusText);
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error.message || 'Network error occurred',
      },
    };
  }
};

