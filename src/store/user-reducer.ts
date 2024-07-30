import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { IRelayPKP, SessionSigsMap } from '@lit-protocol/types';

export interface UserState {
  sessionSigs: SessionSigsMap;
  pkp: IRelayPKP | null;
}

const initialState: UserState = {
  sessionSigs: {},
  pkp: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPkp: (state, action: PayloadAction<IRelayPKP>) => {
      state.pkp = action.payload;
    },
    setSessionSigs: (state, action: PayloadAction<SessionSigsMap>) => {
      state.sessionSigs = action.payload;
    },
    resetUser: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const { setPkp, setSessionSigs, resetUser } = userSlice.actions;

export default userSlice.reducer;
