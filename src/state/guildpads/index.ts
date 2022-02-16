/* eslint-disable no-param-reassign */
import { useSelector } from 'react-redux'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import guildpadsConfig from 'config/constants/guildpads'
import { AppThunk, Guildpad, GuildpadState, State } from '../types'
import fetchGuildpads from './fetchGuildpads'
import { GuildpadConfig } from '../../config/constants/types'

const noAccountGuildpadConfig = guildpadsConfig.map((guildpad) => ({
  ...guildpad,
}))

const initialState: GuildpadState = { data: noAccountGuildpadConfig }

// Async thunks
export const fetchPublicGuildpadDataAsync = createAsyncThunk<Guildpad[], number[]>(
  'guildpad/fetchPublicGuildpadDataAsync',
  async (ids) => {
    const guildpadToFetch = guildpadsConfig.filter((guildpadConfig) => ids.includes(guildpadConfig.id))
    const guildpads = await fetchGuildpads(guildpadToFetch)
    // console.log('guildpadToFetch')
    // console.log(guildpads)

    return guildpads.filter((guildpad) => {
      return guildpad.contractAddress
    })
  },
)

export const guildpadSlice = createSlice({
  name: 'Guildpads',
  initialState,
  reducers: {
    selectGuildpad:  (state, action: PayloadAction<GuildpadConfig>) => {
      state.selected = action.payload
    }
    // setLoadArchivedGuildpadData: (state, action) => {
    //   // const loadArchivedGuildpadData = action.payload
    //   // state.loadArchivedGuildpadData = loadArchivedGuildpadData
    // },
  },
  extraReducers: (builder) => {
    // Update guildpad with live data
    builder.addCase(fetchPublicGuildpadDataAsync.fulfilled, (state, action) => {
      // state.data = state.data.map((guildpad) => {
      //   return { ...guildpad }
      // })

      state.data = state.data.map((guildpad) => {
        const liveGuildpadData = action.payload.find((guildpadData) => guildpadData.id === guildpad.id)
        return { ...guildpad, ...liveGuildpadData }
      })
    })

    // Update guildpad with user data
    // builder.addCase(fetchFarmUserDataAsync.fulfilled, (state, action) => {
    //   action.payload.forEach((userDataEl) => {
    //     const { pid } = userDataEl
    //     const index = state.data.findIndex((farm) => farm.pid === pid)
    //     state.data[index] = { ...state.data[index], userData: userDataEl }
    //   })
    //   state.userDataLoaded = true
    // })
  },
})

// Actions
// export const { setLoadArchivedGuildpadData } = guildpadSlice.actions

export default guildpadSlice.reducer