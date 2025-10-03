import { ApiClient } from './apiClient'

// GET /floor/{floor_id}
export const getFloorById = async (floor_id) => {
  const response = await ApiClient.get(`/floor/${floor_id}`)
  const data = response.data
  if (Array.isArray(data) && data.length === 1) {
    return data[0]
  }
  return data
}

// GET /floor/{floor_id}/elements
export const getElementsByFloor = async (floor_id, { section_id } = {}) => {
  const response = await ApiClient.get(`/floor/${floor_id}/elements`, {
    params: {
      section_id: section_id ?? undefined,
    },
  })
  return response.data
}

// GET /floor/restaurant/{restaurant_id}/tables
export const getAllTablesByRestaurantId = async (
  restaurant_id,
  { section_id, date, start_time, end_time } = {}
) => {
  const response = await ApiClient.get(`/floor/restaurant/${restaurant_id}/tables`, {
    params: {
      section_id: section_id ?? undefined,
      date: date ?? undefined,
      start_time: start_time ?? undefined,
      end_time: end_time ?? undefined,
    },
  })
  return response.data
}

// GET /floor/restaurant/{restaurant_id}/sections
export const getSectionsByRestaurantRule = async (
  restaurant_id,
  { date } = {}
) => {
  const response = await ApiClient.get(`/floor/restaurant/${restaurant_id}/sections`, {
    params: {
      date: date ?? undefined,
    },
  })
  return response.data
}
