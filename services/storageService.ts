
import { BirthdayData } from '../types';

const DRAFT_KEY = 'birthday_maker_draft';
const PAGES_PREFIX = 'birthday_page_';

export const saveDraft = (data: BirthdayData): void => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save draft', error);
  }
};

export const getDraft = (): BirthdayData | null => {
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load draft', error);
    return null;
  }
};

export const savePage = (data: BirthdayData): string => {
  const id = crypto.randomUUID();
  const pageData = { 
    ...data, 
    id, 
    createdAt: new Date().toISOString() 
  };
  try {
    localStorage.setItem(PAGES_PREFIX + id, JSON.stringify(pageData));
    // Clear draft after successful save
    localStorage.removeItem(DRAFT_KEY);
    return id;
  } catch (error) {
    console.error('Failed to save page', error);
    throw error;
  }
};

export const getPage = (id: string): BirthdayData | null => {
  try {
    const data = localStorage.getItem(PAGES_PREFIX + id);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get page', error);
    return null;
  }
};

export const getHistory = (): BirthdayData[] => {
  const items: BirthdayData[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PAGES_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            items.push(parsed);
          } catch (e) {
            console.warn('Failed to parse history item', key);
          }
        }
      }
    }
    // Sort by date descending (newest first)
    return items.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Failed to load history", error);
    return [];
  }
};

export const deletePage = (id: string): void => {
  try {
    localStorage.removeItem(PAGES_PREFIX + id);
  } catch (error) {
    console.error("Failed to delete page", error);
  }
};
