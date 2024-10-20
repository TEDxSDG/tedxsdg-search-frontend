// File: components/utils/apiUtils.ts

import axios from 'axios';
import { setTalks, setSelectedTalk, addSearchHistory } from 'store/talkSlice';
import { setLoading, setApiError, clearApiError } from 'store/apiSlice';
import { AppDispatch } from 'store/store';

/**
 * Perform an API search for talks with proper error handling.
 */
export const performSearch = (query: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  dispatch(clearApiError());

  try {
    const response = await axios.get(
      `https://tedxsdg-search-backend.vercel.app/api/search?query=${encodeURIComponent(query)}`
    );

    if (response.status !== 200) throw new Error(response.statusText);

    const data = response.data.results.map((result: any) => ({
      title: result.document.slug.replace(/_/g, ' '),
      url: `https://www.ted.com/talks/${result.document.slug}`,
      sdg_tags: result.document.sdg_tags || [],
      transcript: result.document.transcript || 'Transcript not available',
    }));

    console.log('Search results:', data);
    dispatch(setTalks(data));
    dispatch(addSearchHistory(query));

    if (data.length > 0) {
      dispatch(setSelectedTalk(data[0]));
    }
  } catch (error) {
    console.error('Error during search:', error);

    if (error instanceof Error) {
      dispatch(setApiError(error.message));
    } else {
      dispatch(setApiError('Failed to fetch talks.'));
    }
  } finally {
    dispatch(setLoading(false));
  }
};
