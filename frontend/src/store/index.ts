import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HandbookSection, Announcement, Bookmark } from '../types';

// Handbook Slice
interface HandbookState {
  sections: HandbookSection[];
  selectedCategory: string;
  loading: boolean;
  error: string;
}

const handbookSlice = createSlice({
  name: 'handbook',
  initialState: {
    sections: [] as HandbookSection[],
    selectedCategory: '',
    loading: false,
    error: '',
  } as HandbookState,
  reducers: {
    setSections: (state: HandbookState, action: PayloadAction<HandbookSection[]>) => {
      state.sections = action.payload;
    },
    addSection: (state: HandbookState, action: PayloadAction<HandbookSection>) => {
      state.sections.unshift(action.payload);
    },
    updateSection: (state: HandbookState, action: PayloadAction<HandbookSection>) => {
      const index = state.sections.findIndex((s: HandbookSection) => s.id === action.payload.id);
      if (index !== -1) {
        state.sections[index] = action.payload;
      }
    },
    deleteSection: (state: HandbookState, action: PayloadAction<string>) => {
      state.sections = state.sections.filter((s: HandbookSection) => s.id !== action.payload);
    },
    setSelectedCategory: (state: HandbookState, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setLoading: (state: HandbookState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: HandbookState, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

// Announcements Slice
interface AnnouncementsState {
  announcements: Announcement[];
  loading: boolean;
  error: string;
}

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState: {
    announcements: [] as Announcement[],
    loading: false,
    error: '',
  } as AnnouncementsState,
  reducers: {
    setAnnouncements: (state: AnnouncementsState, action: PayloadAction<Announcement[]>) => {
      state.announcements = action.payload;
    },
    addAnnouncement: (state: AnnouncementsState, action: PayloadAction<Announcement>) => {
      state.announcements.unshift(action.payload);
    },
    deleteAnnouncement: (state: AnnouncementsState, action: PayloadAction<string>) => {
      state.announcements = state.announcements.filter((a: Announcement) => a.id !== action.payload);
    },
    setLoading: (state: AnnouncementsState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: AnnouncementsState, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

// Bookmarks Slice
interface BookmarksState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string;
}

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState: {
    bookmarks: [] as Bookmark[],
    loading: false,
    error: '',
  } as BookmarksState,
  reducers: {
    setBookmarks: (state: BookmarksState, action: PayloadAction<Bookmark[]>) => {
      state.bookmarks = action.payload;
    },
    addBookmark: (state: BookmarksState, action: PayloadAction<Bookmark>) => {
      if (!state.bookmarks.find((b: Bookmark) => b.sectionId === action.payload.sectionId)) {
        state.bookmarks.push(action.payload);
      }
    },
    removeBookmark: (state: BookmarksState, action: PayloadAction<string>) => {
      state.bookmarks = state.bookmarks.filter((b: Bookmark) => b.sectionId !== action.payload);
    },
    setLoading: (state: BookmarksState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: BookmarksState, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

// Auth Slice
interface AuthState {
  isAuthenticated: boolean;
  user: any;
  token: string;
  role: 'student' | 'admin' | 'faculty';
  loading: boolean;
  error: string;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null as any,
    token: '',
    role: 'student' as 'student' | 'admin' | 'faculty',
    loading: false,
    error: '',
  } as AuthState,
  reducers: {
    setUser: (state: AuthState, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state: AuthState, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setRole: (state: AuthState, action: PayloadAction<'student' | 'admin' | 'faculty'>) => {
      state.role = action.payload;
    },
    logout: (state: AuthState) => {
      state.user = null;
      state.token = '';
      state.isAuthenticated = false;
      state.role = 'student';
    },
    setLoading: (state: AuthState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: AuthState, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

// Search Slice
interface SearchState {
  query: string;
  results: any[];
  isSearching: boolean;
}

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [] as any[],
    isSearching: false,
  } as SearchState,
  reducers: {
    setQuery: (state: SearchState, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setResults: (state: SearchState, action: PayloadAction<any[]>) => {
      state.results = action.payload;
    },
    setIsSearching: (state: SearchState, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    clearSearch: (state: SearchState) => {
      state.query = '';
      state.results = [];
    },
  },
});

// Configure Store
const store = configureStore({
  reducer: {
    handbook: handbookSlice.reducer,
    announcements: announcementsSlice.reducer,
    bookmarks: bookmarksSlice.reducer,
    auth: authSlice.reducer,
    search: searchSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const handbookActions = handbookSlice.actions;
export const announcementsActions = announcementsSlice.actions;
export const bookmarksActions = bookmarksSlice.actions;
export const authActions = authSlice.actions;
export const searchActions = searchSlice.actions;

export default store;
