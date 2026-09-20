// managing booking

// store all booking
// store individual booking
// track the API loading status
// Add new bookings when a booking is created
// updating the booking data when we receive it from the backend


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    bookings: [],
    bookingDetails: {},
    loading: false
}

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        setBookingRequest(state) {
            state.loading = true;
        },
        // stores the bookings received from the api
        setBookings(state, action) {
            state.bookings = action.payload;
            state.loading = false
        },
        addBooking: (state, action) => {
            state.bookings.push(action.payload);
        },
        setBookingDetails: (state, action) => {
            state.bookingDetails = action.payload.bookings;
        }
    }
})

export const { setBookings, addBooking, setBookingDetails } = bookingSlice.actions;
export default bookingSlice;