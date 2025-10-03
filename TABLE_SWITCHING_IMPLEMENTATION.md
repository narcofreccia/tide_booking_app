# Booking Management Features Implementation

## Overview
Implemented comprehensive booking management features for the React Native mobile app, including table switching, status changes, walk-in creation, and booking editing directly from the map view.

## User Flows

### Table Switching Flow
1. **User taps on a table** → `BookingDetailsModal` opens showing booking details
2. **User taps "Sposta" button** → Modal closes, enters switching mode
3. **`SwitchBookingPositionDrawer` appears at bottom** → Ultra-compact drawer shows source booking info
4. **User taps a table on the map** → Table is highlighted in orange, drawer updates to show selected table
5. **User taps "Conferma Spostamento"** → API call executes, queries invalidate, drawer closes, map refreshes

### Status Change Flow
1. **User taps on a table** → `BookingDetailsModal` opens showing booking details
2. **User taps "Stato" button** → `ChangeBookingStatus` modal opens
3. **User selects new status** → Status updates via API
4. **Both modals close** → Map refreshes with new status color

### Walk-In Creation Flow
1. **User taps on a table (empty or occupied)** → `BookingDetailsModal` opens
2. **User taps "Walk-In" button** → `WalkInModal` opens
3. **User enters PAX and optional notes** → Taps "Crea Walk-In"
4. **Walk-in created** → Both modals close, map and bookings list refresh

### Edit Booking Flow
1. **User taps on a table with booking** → `BookingDetailsModal` opens
2. **User taps "Modifica" button** → `EditBookingModal` opens (full screen)
3. **User edits booking details** → Saves changes
4. **Both modals close** → Map and bookings list refresh

## Components Modified/Created

### 1. **SwitchBookingPositionDrawer.js** (NEW)
- Minimal bottom drawer component
- Shows source booking and selected target table
- No embedded map - selection happens on main map
- Props:
  - `open`: boolean
  - `sourceBooking`: booking object to move
  - `selectedTableId`: currently selected target table ID
  - `selectedTableName`: name/number of selected table
  - `onConfirm`: callback when confirmed
  - `onCancel`: callback when cancelled

### 2. **BookingDetailsModal.js** (MODIFIED)
- Added four action buttons in 2x2 grid layout:
  - **Row 1**: "Sposta" (blue) | "Stato" (info)
  - **Row 2**: "Modifica" (orange) | "Walk-In" (green)
- Integrates `ChangeBookingStatus`, `EditBookingModal`, and `WalkInModal`
- Shows "Crea Walk-In" button for empty tables
- Auto-closes after any action
- Compact button layout with proper spacing

### 3. **TablesMapReadOnly.js** (MODIFIED)
- Added `selectedTableId` prop
- Highlights selected table with orange border (#ff6b35)
- Increased stroke width to 3px for selected table

### 4. **BookingsCanvas.js** (MODIFIED)
- Added switching mode support
- Props added:
  - `switchingMode`: boolean - when true, table clicks select instead of showing modal
  - `onTableSelect`: callback for table selection
  - `selectedTableId`: ID of selected table for highlighting
- Modified `handleTablePress` to handle both modes

### 5. **BookingsMapScreen.js** (MODIFIED)
- State management for switching workflow
- Imports `switchTablePosition` API
- Passes switching mode props to BookingsCanvas
- Renders SwitchBookingPositionDrawer
- Handles table selection and confirmation

### 6. **bookingApi.js** (MODIFIED)
- Added `switchTablePosition` function
- POST to `/booking/switch_table_position`
- Payload: `{ source_booking_id, target_table_id }`
- Returns array of updated bookings

### 7. **ChangeBookingStatus.js** (MODIFIED)
- Enhanced query invalidation to refresh map
- Invalidates: `bookings`, `bookings-by-date`, `tables-by-restaurant`
- Ensures map updates immediately after status change

### 8. **WalkInModal.js** (NEW)
- Simple modal for creating walk-in reservations
- Input fields: PAX (required) and Restaurant Notes (optional)
- Shows table info at the top
- Calls `createWalkInBooking` API
- Invalidates all booking queries on success

### 9. **BookingRowActions.js** (MODIFIED)
- Restyled for modern, compact appearance
- Reduced button size from 48x48 to 36x36 pixels
- Refined shadows and spacing
- Enhanced query invalidation on delete
- Better visual consistency with app design
- Removed unused "Move" button

## API Endpoints

### Table Switching
```javascript
POST /booking/switch_table_position
Body: {
  "source_booking_id": number,
  "target_table_id": number
}
Returns: [updated_source_booking] or [updated_source, updated_target] if swapped
```

### Walk-In Creation
```javascript
POST /booking/restaurant/{restaurant_id}/walk-in
Body: {
  "restaurant_id": number,
  "table_ids": [number] | null,
  "adults": number,
  "restaurant_notes": string | null,
  "reservation_date": "YYYY-MM-DD"
}
Returns: created_booking_object
```

## Visual Indicators

- **Selected table**: Orange border (#ff6b35) with 3px stroke width
- **Drawer**: Minimal bottom sheet with source → target info
- **Status**: Green checkmark when table selected, gray when not

## Key Features

✅ **Ultra-compact drawer** - Minimal height to avoid blocking tables
✅ **Visual feedback** - Selected table highlighted in orange
✅ **Smart swapping** - If target has booking, tables are swapped automatically
✅ **Auto-refresh** - Query invalidation refreshes bookings and tables after all actions
✅ **4-in-1 Actions** - Table switching, status change, edit, and walk-in creation
✅ **Empty table support** - Walk-in button available for empty tables
✅ **Comprehensive invalidation** - All actions refresh both map and bookings list
✅ **Easy cancellation** - Close button or cancel button on all modals

## Drawer Design

The drawer is intentionally **very compact** to maximize map visibility:
- Single-line info display: "Name (Table X) → Table Y ✓"
- Minimal padding (8-12px)
- Small fonts (12-14px)
- Total height: ~80-90px
- Positioned at bottom, doesn't block center of map

## Files Changed

1. `/services/bookingApi.js` - Added `switchTablePosition` and `createWalkInBooking` API functions
2. `/components/booking_manager/SwitchBookingPositionDrawer.js` - NEW compact drawer
3. `/components/booking_manager/WalkInModal.js` - NEW walk-in creation modal
4. `/components/booking_manager/BookingDetailsModal.js` - Added 4 action buttons & modal integrations
5. `/components/booking_manager/TablesMapReadOnly.js` - Added table highlighting & full-size panning
6. `/components/booking_manager/BookingsCanvas.js` - Added switching mode support & props passing
7. `/screens/BookingsMapScreen.js` - Integrated complete workflow
8. `/components/bookings/ChangeBookingStatus.js` - Enhanced query invalidation
9. `/components/bookings/BookingRowActions.js` - Restyled & enhanced query invalidation
10. `/components/bookings/EditBookingModal.js` - Integrated into map workflow

## Summary

This implementation provides a complete, polished booking management experience:
- ✅ Quick table switching with visual feedback
- ✅ Fast status changes from map view
- ✅ Walk-in creation from any table (empty or occupied)
- ✅ Full booking editing capabilities
- ✅ Automatic data refresh across all views (map + list)
- ✅ Clean, modern UI that blends with app design
- ✅ Minimal, non-intrusive drawer design
- ✅ Smart query invalidation for instant updates
- ✅ Full-size pannable map for better readability
- ✅ 2x2 action button grid for quick access to all features
