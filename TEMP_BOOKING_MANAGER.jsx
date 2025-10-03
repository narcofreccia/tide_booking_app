//BookingManager
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Dialog from '@mui/material/Dialog'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import MapIcon from '@mui/icons-material/Map'
import { Protected } from 'src/components/protected/Protected'
import { BookingsTableView } from 'src/features/admin/booking/components/BookingsTableView'
import { useValue } from 'src/context/ContextProvider'
import { BookingRestaurantSelect } from 'src/features/admin/booking/components/BookingRestaurantSelect'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import { BookingSectionBar } from 'src/features/admin/booking/components/BookingSectionBar'
import dayjs from 'dayjs'
import { BookingDatePicker } from 'src/features/admin/booking/components/BookingDatePicker'
import IconButton from '@mui/material/IconButton'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { CreateNewBooking } from 'src/features/admin/booking/components/CreateNewBooking'
import { WalkInReservation } from 'src/features/admin/booking/components/WalkInReservation'
import { BookingList } from 'src/features/admin/booking/components/BookingList'
import { SwitchBookingPositionDrawer } from '../components/booking_manager/SwitchBookingPositionDrawer'
import { BookingStatusLegend } from 'src/features/admin/booking/components/BookingStatusLegend'
import { switchTablePosition } from '../services/bookingApi'
import { useQueryClient } from '@tanstack/react-query'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import ListIcon from '@mui/icons-material/List'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import LayersIcon from '@mui/icons-material/Layers'
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export const BookingManager = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const queryClient = useQueryClient()
  const {
      state: { currentRestaurant, bookingFilter },
      dispatch,
  } = useValue()
  const [mapRefreshKey, setMapRefreshKey] = useState(0)
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [selectedFloorId, setSelectedFloorId] = useState(null)
  const [selectedTableIds, setSelectedTableIds] = useState([])
  const [selectedInterval, setSelectedInterval] = useState(null)
  const [highlightedTableIds, setHighlightedTableIds] = useState([])
  const [currentBookings, setCurrentBookings] = useState([])
  const [editingBooking, setEditingBooking] = useState(null)
  const [forceOpenBooking, setForceOpenBooking] = useState(false)
  const [preselectedTableIds, setPreselectedTableIds] = useState([])
  const [editingWalkIn, setEditingWalkIn] = useState(null)
  const [forceOpenWalkIn, setForceOpenWalkIn] = useState(false)
  const [walkInTableIds, setWalkInTableIds] = useState([])
  const [switchDrawerOpen, setSwitchDrawerOpen] = useState(false)
  const [switchingBooking, setSwitchingBooking] = useState(null)
  const [selectedTargetTable, setSelectedTargetTable] = useState(null)
  const [tables, setTables] = useState([])
  const [isTableMovementLocked, setIsTableMovementLocked] = React.useState(true) // Default to locked on mobile
  const [configError, setConfigError] = React.useState(null) // 'no_floor' | 'no_time_ranges' | null
  const [mobileView, setMobileView] = useState('map') // 'map' or 'list'

  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const compatView = useMediaQuery(theme.breakpoints.down('lg'));
  console.log("isMobile", isMobile)
    
    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
  
  // Reset forceOpen after it's been used
  React.useEffect(() => {
    if (forceOpenBooking) {
      // Reset after a short delay to allow the modal to open
      const timer = setTimeout(() => {
        setForceOpenBooking(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [forceOpenBooking])

  // Reset forceOpen for WalkIn after it's been used
  React.useEffect(() => {
    if (forceOpenWalkIn) {
      // Reset after a short delay to allow the modal to open
      const timer = setTimeout(() => {
        setForceOpenWalkIn(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [forceOpenWalkIn])


  const restaurantId = bookingFilter?.restaurant_id 
  const dateStr = (() => {
    const d = bookingFilter?.date ? dayjs(bookingFilter.date) : dayjs()
    return d.isValid() ? d.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  })()

  // Date initialization is now handled by BookingDatePicker component

  // Reset section and interval selection when restaurant changes
  React.useEffect(() => {
    setSelectedSectionId(null)
    setSelectedFloorId(null)
    setSelectedInterval(null)
  }, [restaurantId])

  const handleCancel = () => {
    navigate('/dashboard')
  }

  // Handle switching booking position
  const handleSwitchBooking = (booking) => {
    setSwitchingBooking(booking)
    setSwitchDrawerOpen(true)
    setSelectedTargetTable(null)
    // Start switching mode in context
    dispatch({ type: 'START_TABLE_SWITCHING', payload: booking })
  }

  const handleTableSwitch = (targetTableId) => {
    setSelectedTargetTable(targetTableId)
  }

  const handleConfirmSwitch = async () => {
    if (!switchingBooking || !selectedTargetTable) return

    try {
      const result = await switchTablePosition({
        source_booking_id: switchingBooking.id,
        target_table_id: selectedTargetTable
      })
      
      // Invalidate bookings queries to refresh data immediately
      const restaurantId = bookingFilter?.restaurant_id
      const dateStr = bookingFilter?.date || dayjs().format('YYYY-MM-DD')
      
      if (restaurantId && dateStr) {
        // Invalidate the correct bookings query key used in BookingsTableView
        await queryClient.invalidateQueries({
          queryKey: ['bookings-by-date', restaurantId, dateStr]
        })
        
        // Also invalidate any interval-specific queries
        await queryClient.invalidateQueries({
          queryKey: ['bookings-by-date']
        })
      }
      
      // Refresh the map to show updated bookings
      setMapRefreshKey(prev => prev + 1)
      
      // Close drawer and reset state
      handleCancelSwitch()
      
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'success',
          message: result.length > 1 ? 'Prenotazioni scambiate con successo' : 'Prenotazione spostata con successo'
        }
      })
    } catch (error) {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: error.message || 'Errore durante lo spostamento della prenotazione'
        }
      })
    }
  }

  const handleCancelSwitch = () => {
    setSwitchDrawerOpen(false)
    setSwitchingBooking(null)
    setSelectedTargetTable(null)
    // End switching mode in context
    dispatch({ type: 'END_TABLE_SWITCHING' })
  }

  const handleShiftDay = React.useCallback((direction) => {
    // Use a valid base date - if bookingFilter.date is invalid, use today
    let base = dayjs()
    if (bookingFilter?.date && dayjs(bookingFilter.date).isValid()) {
      base = dayjs(bookingFilter.date)
    }
    
    const next = direction === 'prev' ? base.subtract(1, 'day') : base.add(1, 'day')
    const formatted = next.format('YYYY-MM-DD')
    dispatch({ type: 'UPDATE_BOOKING_FILTER', payload: { ...(bookingFilter || {}), date: formatted } })
  }, [bookingFilter, dispatch])

  // Keyboard arrow support: left/right to change day globally (use window, capture phase)
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleShiftDay('prev')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleShiftDay('next')
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [handleShiftDay])

  const handleToggleTableMovement = () => {
    setIsTableMovementLocked(prev => !prev)
  }

  const handleConfigError = (errorType, hasData) => {
    setConfigError(errorType)
  }

  return (
    <Protected message={'Accesso consentito solo ad utenti manager'}>
      <Dialog
        fullScreen
        open={true}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mb: 1,
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            bgcolor: 'background.default',
          }}
        >
          {/* Desktop Header - Two Row Layout */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              background: (theme) =>
                `linear-gradient(to right, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
              borderRadius: '8px 8px 0 0',
            }}
          >
            {/* First Row - Main Header */}
            <Box
              sx={{
                display: 'flex',
                p: 1.5,
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Box
                component="span"
                sx={{
                  background: (theme) =>
                    `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  width: 4,
                  height: 24,
                  borderRadius: 1,
                  display: 'inline-block',
                }}
              />
              {compatView ? 'BM' : 'Booking Manager'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ minWidth: 280 }}>
                <BookingRestaurantSelect />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton aria-label="previous day" size="small" onClick={() => handleShiftDay('prev')} sx={{ color: 'text.secondary' }}>
                  <NavigateBeforeIcon fontSize="small" />
                </IconButton>
                <Box sx={{ minWidth: 180 }}>
                  <BookingDatePicker />
                </Box>
                <IconButton aria-label="next day" size="small" onClick={() => handleShiftDay('next')} sx={{ color: 'text.secondary' }}>
                  <NavigateNextIcon fontSize="small" />
                </IconButton>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const today = dayjs().format('YYYY-MM-DD')
                    localStorage.setItem('bookingManager_selectedDate', today)
                    dispatch({ type: 'UPDATE_BOOKING_FILTER', payload: { ...bookingFilter, date: today } })
                  }}
                  sx={{ 
                    minWidth: 'auto',
                    px: 1.5,
                    height: 32,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main'
                    }
                  }}
                >
                  Today
                </Button>
              </Box>
                {/* Single CreateNewBooking component for both desktop and mobile */}
              <CreateNewBooking 
                mode={editingBooking ? 'update' : 'create'}
                booking={editingBooking}
                forceOpen={forceOpenBooking}
                selectedTableIds={preselectedTableIds.length > 0 ? preselectedTableIds : selectedTableIds} 
                onGetCurrentTableIds={(getCurrentTableIds) => {
                  window.getCurrentBookingTableIds = getCurrentTableIds
                }}
                onButtonClick={() => {
                  setEditingBooking(null)
                  setForceOpenBooking(false)
                }}
                onUpdated={() => {
                  setEditingBooking(null)
                  setForceOpenBooking(false)
                  setPreselectedTableIds([])
                  setSelectedTableIds([]) // Clear selected table IDs
                }}
                onCreated={() => {
                  setEditingBooking(null)
                  setForceOpenBooking(false)
                  setPreselectedTableIds([])
                  setSelectedTableIds([]) // Clear selected table IDs
                }}
                onClose={() => {
                  setEditingBooking(null)
                  setForceOpenBooking(false)
                  setPreselectedTableIds([])
                  setSelectedTableIds([]) // Clear selected table IDs
                }}
              />
              {/* add here dotted menu */}
              
              <IconButton
                onClick={handleCancel}
                size="small"
                color="secondary"
              >
                <ExitToAppIcon />
              </IconButton>
              <IconButton
                  aria-label="more actions"
                  aria-controls="menu-actions"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                  size="small"
                  //sx={{ mr: 1 }}
                >
                  <MoreVertIcon />
                </IconButton>
               <Menu
                id="menu-actions"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{ sx: { p: 0 } }}
              >
                <MenuItem 
                  onClick={() => {
                    navigate('/dashboard/floor-manager')
                    handleMenuClose()
                  }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LayersIcon fontSize="small" />
                  Floor Manager
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    navigate('/dashboard/calendar-manager')
                    handleMenuClose()
                  }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <CalendarMonthIcon fontSize="small" />
                  Calendar Manager
                </MenuItem>
                {/* Add menu actions here if needed */}
              </Menu>
            </Box>
            </Box>

            {/* Second Row - BookingSectionBar */}
            {restaurantId && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <BookingSectionBar
                  restaurantId={restaurantId}
                  date={dateStr}
                  value={selectedSectionId}
                  onChange={(sectionId, floorId) => {
                    setSelectedSectionId(sectionId)
                    setSelectedFloorId(floorId)
                  }}
                  onIntervalChange={(interval) => setSelectedInterval(interval)}
                  isTableMovementLocked={isTableMovementLocked}
                  onToggleTableMovement={handleToggleTableMovement}
                  onError={handleConfigError}
                />
              </Box>
            )}
          </Box>

          {/* Mobile Header - Multiple Rows */}
          {isMobile && (
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              gap: 1,
              p: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                `linear-gradient(to right, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
              borderRadius: '8px 8px 0 0',
            }}
          >
            
            {/* First Row: Title and Exit */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                variant="subtitle2"
                component="div"
                sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Box
                  component="span"
                  sx={{
                    background: (theme) =>
                      `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    width: 3,
                    height: 18,
                    borderRadius: 1,
                    display: 'inline-block',
                  }}
                />
                {compatView ? 'BM' : 'Booking Manager'}
              </Typography>
              <IconButton
                onClick={handleCancel}
                size="small"
                color="secondary"
              >
                <ExitToAppIcon />
              </IconButton>
              
            </Box>

            {/* Second Row: Restaurant Select */}
            <Box sx={{ width: '100%' }}>
              <BookingRestaurantSelect />
            </Box>

            {/* Third Row: Date Navigation and Create Booking */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton aria-label="previous day" size="small" onClick={() => handleShiftDay('prev')} sx={{ color: 'text.secondary' }}>
                  <NavigateBeforeIcon fontSize="small" />
                </IconButton>
                <Box sx={{ minWidth: 140 }}>
                  <BookingDatePicker />
                </Box>
                <IconButton aria-label="next day" size="small" onClick={() => handleShiftDay('next')} sx={{ color: 'text.secondary' }}>
                  <NavigateNextIcon fontSize="small" />
                </IconButton>
              </Box>
              <IconButton
                onClick={() => {
                  setEditingBooking(null)
                  setForceOpenBooking(true)
                }}
                size="small"
                color="primary"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  width: 32,
                  height: 32,
                }}
              >
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          )}

        
        </Box>

        {/* Content */}
        <Box sx={{ 
          p: { xs: 1, md: 3 }, 
          bgcolor: 'background.paper', 
          height: { xs: 'calc(100vh - 60px)', md: 'calc(100vh - 80px)' }, 
          overflow: { xs: 'auto', md: 'auto' }, // Enable scrolling when needed
          // Enable smooth scrolling
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            width: { xs: '4px', md: '6px' },
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0,0,0,0.3)',
          },
        }}>
          {/* BookingSectionBar - Mobile Only (Desktop is in header) */}
          {restaurantId && isMobile && (
            <Box sx={{ 
              alignItems: 'center', 
              mb: 1,
              width: '100%',
              overflow: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none'
            }}>
              <BookingSectionBar
                restaurantId={restaurantId}
                date={dateStr}
                value={selectedSectionId}
                onChange={(sectionId, floorId) => {
                  setSelectedSectionId(sectionId)
                  setSelectedFloorId(floorId)
                }}
                onIntervalChange={(interval) => setSelectedInterval(interval)}
                isTableMovementLocked={isTableMovementLocked}
                onToggleTableMovement={handleToggleTableMovement}
                onError={handleConfigError}
              />
            </Box>
          )}

          {/* Main Content Area */}
          <Box sx={{ 
            flex: 1,
            minHeight: 0,
            height: '100%',
          }}>
            <Grid container spacing={{ xs: 1, md: 2 }} sx={{ 
              height: { xs: 'auto', md: '100%' }, 
              minHeight: { xs: '100%', md: 'auto' },
              flexDirection: 'column' 
            }}>
              {/* Mobile View Toggle */}
              <Grid item xs="auto" sx={{ display: { xs: 'block', md: 'none' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <ToggleButtonGroup
                  value={mobileView}
                  exclusive
                  onChange={(event, newView) => {
                    if (newView !== null) {
                      setMobileView(newView)
                    }
                  }}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      px: 3,
                      py: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="map" aria-label="map view">
                    <MapIcon sx={{ mr: 1 }} />
                    Mappa
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ListIcon sx={{ mr: 1 }} />
                    Lista
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>

            <Grid item xs sx={{ 
              minHeight: { xs: 'auto', md: 0 },
              flex: { xs: 'none', md: '1 1 auto' }
            }}>
              {configError ? (
                // Show error message instead of booking content
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: { xs: 'calc(100vh - 200px)', md: '100%' },
                  p: 3
                }}>
                  <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Ristorante Chiuso/Regola Calendario Non Impostata
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Non è stata configurata una regola calendario per questo ristorante e data.
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/dashboard/calendar-manager')}
                        startIcon={<DashboardCustomizeIcon />}
                      >
                        Configura Calendario
                      </Button>
                    </Alert>
                  </Paper>
                </Box>
              ) : (
                // Show normal booking content
                <Grid container spacing={{ xs: 1, md:1 }} sx={{ 
                  height: { xs: 'auto', md: '100%' },
                  minHeight: 'calc(100vh - 200px)',
                  alignItems: 'stretch'
                }}>
                {/* BookingList on the left - Desktop only */}
                {!isMobile && (
                <Grid item xs={12} md={5} sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
                  <BookingList
                    bookings={currentBookings}
                    tables={tables}
                    onHoverTableIds={(tableIds, booking) => {
                      setHighlightedTableIds(tableIds)
                    }}
                    onLeaveHover={() => setHighlightedTableIds([])}
                    onEditBooking={(booking) => {
                      setEditingBooking(booking)
                      setForceOpenBooking(true)
                    }}
                    onSwitchBooking={handleSwitchBooking}
                  />
                </Grid>
                )}
                
                
                {/* Canvas on the right - Desktop, or Mobile Map View */}
                <Grid item xs={12} md={7} sx={{ 
                  display: { xs: mobileView === 'map' ? 'block' : 'none', md: 'block' },
                  height: { xs: 'auto', md: '100%' },
                  minHeight: { xs: '400px', md: '100%' }
                }}>
                  <BookingsTableView
                    restaurantId={restaurantId}
                    sectionId={selectedSectionId}
                    floorId={selectedFloorId}
                    date={dateStr}
                    interval={selectedInterval}
                    refreshKey={mapRefreshKey}
                    onBookingsChange={setCurrentBookings}
                    onTablesLoaded={setTables}
                    highlightIds={highlightedTableIds}
                    initialSelectedIds={selectedTableIds}
                    onSelectionChange={setSelectedTableIds}
                    onEditBooking={(booking) => {
                      setEditingBooking(booking)
                      // Pre-select the booking's existing table IDs for editing
                      if (booking?.table_ids && Array.isArray(booking.table_ids)) {
                        setSelectedTableIds(booking.table_ids)
                      }
                      setForceOpenBooking(true)
                    }}
                    onCreateBooking={(tableId) => {
                      setPreselectedTableIds([tableId])
                      setForceOpenBooking(true)
                    }}
                    onCreateWalkIn={(tableId) => {
                      setEditingWalkIn(null) // Clear any existing walk-in
                      setWalkInTableIds([tableId])
                      setForceOpenWalkIn(true)
                    }}
                    onTableSwitch={handleTableSwitch}
                    onSwitchBooking={handleSwitchBooking}
                    selectedTargetTableId={selectedTargetTable}
                    isTableMovementLocked={isTableMovementLocked}
                  />
                  <Box sx={{ mt: { xs: 1, md: 2 }, display: { xs: mobileView === 'map' ? 'block' : 'none', md: 'block' } }}>
                    <BookingStatusLegend title="Legenda stati" size="small" />
                  </Box>
                </Grid>
                
                
                {/* Mobile List View */}
                {isMobile && mobileView === 'list' && (
                <Grid item xs={12} sx={{ 
                  height: { xs: 'auto', md: '100%' },
                  minHeight: { xs: '400px', md: '100%' }
                }}>
                  <BookingList
                    bookings={currentBookings}
                    tables={tables}
                    onHoverTableIds={(tableIds, booking) => {
                      setHighlightedTableIds(tableIds)
                    }}
                    onLeaveHover={() => setHighlightedTableIds([])}
                    onEditBooking={(booking) => {
                      setEditingBooking(booking)
                      setForceOpenBooking(true)
                    }}
                    onSwitchBooking={handleSwitchBooking}
                  />
                </Grid>
                )}
              </Grid>
              )}
            </Grid>
          </Grid>
          </Box>

            {/* WalkInReservation modal (no button, only triggered from TablesMenu) */}
            <WalkInReservation 
                mode={editingWalkIn ? 'update' : 'create'}
                booking={editingWalkIn}
                forceOpen={forceOpenWalkIn}
                table_ids={walkInTableIds}
                showButton={false}
                onButtonClick={() => {
                  // This should never be called since we hide the button
                  setEditingWalkIn(null)
                  setForceOpenWalkIn(false)
                  setWalkInTableIds([])
                }}
                onUpdated={() => {
                  setEditingWalkIn(null)
                  setForceOpenWalkIn(false)
                  setWalkInTableIds([])
                }}
                onCreated={() => {
                  setEditingWalkIn(null)
                  setForceOpenWalkIn(false)
                  setWalkInTableIds([])
                }}
              />
                {/* Hidden Drawers and Modals */}
          <SwitchBookingPositionDrawer
            open={switchDrawerOpen}
            onClose={handleCancelSwitch}
            sourceBooking={switchingBooking}
            selectedTableId={selectedTargetTable}
            onTableSelect={handleTableSwitch}
            onConfirm={handleConfirmSwitch}
            onCancel={handleCancelSwitch}
            floor={selectedFloorId ? { id: selectedFloorId } : null}
            tables={tables}
            bookingsByTable={{}}
          />

        
        </Box>
      </Dialog>
    </Protected>
  )
}


//BookingSectionBar
import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useValue } from 'src/context/ContextProvider'
import { getSectionsByRestaurantRule } from 'src/features/admin/floor-manager/floorManagerApi'
import { BookingSectionTabs } from './BookingSectionTabs'
import { BookingIntervalTabs } from './BookingIntervalTabs'
import { BookingActions } from './BookingActions'


/**
 * BookingSectionBar
 * Main parent component that manages data fetching and coordinates child components
 * Props:
 * - restaurantId: number (required)
 * - date: string (YYYY-MM-DD) optional (defaults to today)
 * - value: number|null selected section id (optional controlled)
 * - onChange: (sectionId:number) => void
 * - onIntervalChange?: (interval: { start_time: string, end_time: string }, index: number) => void
 * - isTableMovementLocked?: boolean - whether table movement is locked
 * - onToggleTableMovement?: () => void - callback when table movement lock is toggled
 * - onError?: (errorType: 'no_floor' | 'no_time_ranges', hasData: boolean) => void - callback for error states
 */
export const BookingSectionBar = ({ 
  restaurantId, 
  date, 
  value, 
  onChange, 
  onIntervalChange,
  isTableMovementLocked = false,
  onToggleTableMovement,
  onError
}) => {
  const { dispatch } = useValue()
  
  // Initialize from localStorage if available
  const [selected, setSelected] = React.useState(() => {
    if (value !== undefined && value !== null) return value
    const stored = localStorage.getItem('bookingManager_selectedSection')
    return stored ? parseInt(stored, 10) : null
  })
  const [selectedIntervalIndex, setSelectedIntervalIndex] = React.useState(null)
  
  // Track previous restaurantId to detect actual changes
  const prevRestaurantIdRef = React.useRef(restaurantId)
 
  React.useEffect(() => {
    if (value !== undefined) setSelected(value)
  }, [value])

  // Reset selected section when restaurant ACTUALLY changes (not on initial mount)
  React.useEffect(() => {
    const prevRestaurantId = prevRestaurantIdRef.current
    
    // Only clear if restaurant changed (not on initial mount)
    if (prevRestaurantId !== undefined && prevRestaurantId !== restaurantId) {
      setSelected(null)
      setSelectedIntervalIndex(null)
      localStorage.removeItem('bookingManager_selectedSection')
    }
    
    // Update ref for next comparison
    prevRestaurantIdRef.current = restaurantId
  }, [restaurantId])

  // Data fetching logic - shared between child components
  const todayStr = React.useMemo(() => {
    // Accept both string or dayjs/date for `date` and normalize to YYYY-MM-DD
    const d = date ? dayjs(date) : dayjs()
    return d.isValid() ? d.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  }, [date])
  
  const { data, error, isError } = useQuery({
    queryKey: ['restaurant-sections-by-date', restaurantId, todayStr],
    queryFn: () => getSectionsByRestaurantRule(restaurantId, { date: todayStr }),
    enabled: !!restaurantId,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('BookingSectionBar API Error:', error)
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: error?.response?.data?.detail || 'Errore caricamento sezioni',
        },
      })
    },
  })

  // API now returns an object: { sections: [...], time_ranges: [...] }
  const sections = React.useMemo(() => {
    const s = data?.sections
    return Array.isArray(s) ? s : []
  }, [data])

  const timeRanges = React.useMemo(() => {
    const t = data?.time_ranges
    return Array.isArray(t) ? t : []
  }, [data])

  const selectedInterval = timeRanges?.[selectedIntervalIndex]

  // Error detection and reporting
  React.useEffect(() => {
    if (onError && restaurantId) {
      // If query failed (e.g., no floor found), treat as no_floor error
      if (isError) {
        onError('no_floor', false)
        return
      }
      
      // If query succeeded but no data or empty sections
      if (data !== undefined) {
        const hasData = !!data
        if (!hasData || sections.length === 0) {
          // No floor/sections configured
          onError('no_floor', hasData)
          return
        }
        if (timeRanges.length === 0) {
          // No time ranges configured
          onError('no_time_ranges', hasData)
          return
        }
        // Clear any previous errors if data is now valid
        onError(null, hasData)
      }
    }
  }, [data, sections, timeRanges, onError, restaurantId, isError])

  // Auto-select first section if none selected, or restore from localStorage
  React.useEffect(() => {
    if (selected == null && Array.isArray(sections) && sections.length > 0) {
      // Try to restore from localStorage first
      const stored = localStorage.getItem('bookingManager_selectedSection')
      const storedId = stored ? parseInt(stored, 10) : null
      
      // Check if stored section exists in current sections
      const storedSection = storedId && sections.find(s => s.id === storedId)
      
      // Use stored section if valid, otherwise use first section
      const targetSection = storedSection || sections[0]
      
      if (targetSection?.id != null) {
        setSelected(targetSection.id)
        // Persist the selection
        localStorage.setItem('bookingManager_selectedSection', targetSection.id.toString())
        onChange?.(targetSection.id, targetSection.floor_id)
      }
    }
  }, [sections, selected, onChange])

  // Auto-select appropriate interval based on current time
  React.useEffect(() => {
    if (selectedIntervalIndex != null || !timeRanges || timeRanges.length === 0) {
      return // Don't auto-select if already selected or no time ranges
    }

    const now = dayjs()
    const currentTime = now.format('HH:mm:ss')
    
    // Sort time ranges chronologically
    const sortedTimeRanges = [...timeRanges].sort((a, b) => {
      if (!a.start_time || !b.start_time) return 0
      return a.start_time.localeCompare(b.start_time)
    })
    
    let targetIndex = -1 // Default to "Tutti"

    // Check if current time is within any interval
    for (let i = 0; i < sortedTimeRanges.length; i++) {
      const tr = sortedTimeRanges[i]
      if (tr.start_time && tr.end_time && currentTime >= tr.start_time && currentTime <= tr.end_time) {
        targetIndex = timeRanges.findIndex(original => 
          original.start_time === tr.start_time && original.end_time === tr.end_time
        )
        break
      }
    }

    // If not in any interval, find the next upcoming one
    if (targetIndex === -1) {
      for (let i = 0; i < sortedTimeRanges.length; i++) {
        const tr = sortedTimeRanges[i]
        if (tr.start_time && currentTime < tr.start_time) {
          targetIndex = timeRanges.findIndex(original => 
            original.start_time === tr.start_time && original.end_time === tr.end_time
          )
          break
        }
      }
    }

    // Set the selected interval
    setSelectedIntervalIndex(targetIndex)
    
    // Notify parent
    if (targetIndex === -1) {
      onIntervalChange?.(null, targetIndex)
    } else {
      const interval = timeRanges[targetIndex]
      if (interval) onIntervalChange?.(interval, targetIndex)
    }
  }, [selectedIntervalIndex, timeRanges, onIntervalChange])

  const handleTabChange = (event, newValue) => {
    setSelected(newValue)
    // Persist to localStorage
    localStorage.setItem('bookingManager_selectedSection', newValue.toString())
    // Find the selected section and pass both id and floor_id
    const selectedSection = sections.find(s => s.id === newValue)
    onChange?.(newValue, selectedSection?.floor_id)
  }

  const handleIntervalChange = (event, newIndex) => {
    setSelectedIntervalIndex(newIndex)
    
    // If "Tutti" is selected (index -1), pass null to show all bookings
    if (newIndex === -1) {
      onIntervalChange?.(null, newIndex)
    } else {
      const interval = timeRanges?.[newIndex]
      if (interval) onIntervalChange?.(interval, newIndex)
    }
  }

  return (
    <>
      {/* Desktop Layout - Horizontal */}
      <Box sx={{ 
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: 1.5, 
        width: '100%'
      }}>
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <BookingSectionTabs
            sections={sections}
            selected={selected}
            onTabChange={handleTabChange}
          />
        </Box>
        
        <Box sx={{ flex: '0 0 auto' }}>
          <BookingActions
            restaurantId={restaurantId}
            selectedInterval={selectedInterval}
            selectedDate={todayStr}
            isTableMovementLocked={isTableMovementLocked}
            onToggleTableMovement={onToggleTableMovement}
            isDisabled={selectedIntervalIndex === -1}
          />
        </Box>
        
        <Box sx={{ flex: '0 0 auto', minWidth: 0 }}>
          <BookingIntervalTabs
            timeRanges={timeRanges}
            selectedIntervalIndex={selectedIntervalIndex}
            onIntervalChange={handleIntervalChange}
          />
        </Box>
      </Box>

      {/* Mobile Layout - Vertical Stack */}
      <Box sx={{ 
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        gap: 1,
        width: '100%'
      }}>
        {/* First Row: Section Select and Lock Button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          width: '100%'
        }}>
          <Box sx={{ flex: '1 1 auto' }}>
            <BookingSectionTabs
              sections={sections}
              selected={selected}
              onTabChange={handleTabChange}
            />
          </Box>
          <Box sx={{ flex: '0 0 auto' }}>
            <BookingActions
              restaurantId={restaurantId}
              selectedInterval={selectedInterval}
              selectedDate={todayStr}
              isTableMovementLocked={isTableMovementLocked}
              onToggleTableMovement={onToggleTableMovement}
              isDisabled={selectedIntervalIndex === -1}
            />
          </Box>

        </Box>

        {/* Second Row: Interval Select */}
        <Box sx={{ width: '100%' }}>
          <BookingIntervalTabs
            timeRanges={timeRanges}
            selectedIntervalIndex={selectedIntervalIndex}
            onIntervalChange={handleIntervalChange}
          />
        </Box>
      </Box>
    </>
  )
}

//BookingSectionTabs
import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { styled } from '@mui/material/styles'

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 2,
  },
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.pxToRem(14),
  minHeight: 40,
  padding: theme.spacing(0.5, 1.5),
  marginRight: 0,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}))

/**
 * BookingSectionTabs
 * Child component that renders section tabs (desktop) or select (mobile)
 * Props:
 * - sections: Array<Section> (required)
 * - selected: number|null selected section id
 * - onTabChange: (event, newValue) => void
 */
export const BookingSectionTabs = ({ sections, selected, onTabChange }) => {
  const handleSelectChange = (event) => {
    onTabChange(event, event.target.value)
  }

  return (
    <>
      {/* Desktop Tabs */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
        }}
      >
        <StyledTabs
          value={selected ?? false}
          onChange={onTabChange}
          aria-label="booking sections tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            '& .MuiTabs-flexContainer': {
              gap: 0.5,
            },
          }}
        >
            {(sections || []).map((section) => (
              <StyledTab
                key={section.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{section.name}</Typography>
                  </Box>
                }
                value={section.id}
              />
            ))}
        </StyledTabs>
      </Box>

      {/* Mobile Select */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, minWidth: 120 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="section-select-label">Sezione</InputLabel>
          <Select
            labelId="section-select-label"
            value={selected ?? ''}
            label="Sezione"
            onChange={handleSelectChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            {(sections || []).map((section) => (
              <MenuItem key={section.id} value={section.id}>
                {section.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </>
  )
}

//BookingSectionInterval
import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { styled } from '@mui/material/styles'
import dayjs from 'dayjs'

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 2,
  },
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.pxToRem(14),
  minHeight: 40,
  padding: theme.spacing(0.5, 1.5),
  marginRight: 0,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}))

/**
 * BookingIntervalTabs
 * Child component that renders time interval tabs (desktop) or select (mobile)
 * Props:
 * - timeRanges: Array<TimeRange> (required)
 * - selectedIntervalIndex: number|null selected interval index
 * - onIntervalChange: (event, newIndex) => void
 */
export const BookingIntervalTabs = ({ timeRanges, selectedIntervalIndex, onIntervalChange }) => {
  const formatTime = (t) => {
    if (!t || typeof t !== 'string') return ''
    const hhmm = t.slice(0, 5)
    return hhmm.replace(':', '.')
  }

  const handleSelectChange = (event) => {
    onIntervalChange(event, event.target.value)
  }

  const getIntervalLabel = (tr) => {
    return `${formatTime(tr.start_time)}-${formatTime(tr.end_time)}`
  }

  // Sort time ranges chronologically
  const sortedTimeRanges = React.useMemo(() => {
    if (!timeRanges || timeRanges.length === 0) return []
    
    return [...timeRanges].sort((a, b) => {
      if (!a.start_time || !b.start_time) return 0
      return a.start_time.localeCompare(b.start_time)
    })
  }, [timeRanges])

  return (
    <>
      {/* Desktop Tabs */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          ml: 'auto',
        }}
      >
        <StyledTabs
          value={selectedIntervalIndex ?? false}
          onChange={onIntervalChange}
          aria-label="booking intervals tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            '& .MuiTabs-flexContainer': {
              gap: 0.5,
            },
          }}
        >
          {/* "Tutti" tab to show all bookings */}
          <StyledTab
            key="interval-all"
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Tutti
                </Typography>
              </Box>
            }
            value={-1}
          />
          
          {/* Time interval tabs - sorted chronologically */}
          {sortedTimeRanges.map((tr) => {
            // Find the original index for this sorted time range
            const originalIndex = timeRanges.findIndex(original => 
              original.start_time === tr.start_time && original.end_time === tr.end_time
            )
            return (
              <StyledTab
                key={`interval-${originalIndex}`}
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1 }}>
                    <Typography variant="body2">
                      {getIntervalLabel(tr)}
                    </Typography>
                  </Box>
                }
                value={originalIndex}
              />
            )
          })}
        </StyledTabs>
      </Box>

      {/* Mobile Select */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, minWidth: 100 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="interval-select-label">Orario</InputLabel>
          <Select
            labelId="interval-select-label"
            value={selectedIntervalIndex ?? -1}
            label="Orario"
            onChange={handleSelectChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            <MenuItem value={-1}>Tutti</MenuItem>
            {sortedTimeRanges.map((tr) => {
              // Find the original index for this sorted time range
              const originalIndex = timeRanges.findIndex(original => 
                original.start_time === tr.start_time && original.end_time === tr.end_time
              )
              return (
                <MenuItem key={`interval-${originalIndex}`} value={originalIndex}>
                  {getIntervalLabel(tr)}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </Box>
    </>
  )
}

//BookingsTableView
import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useValue } from 'src/context/ContextProvider'
import dayjs from 'dayjs'
import { getAllTablesByRestaurantId } from 'src/features/admin/floor-manager/floorManagerApi'
import { getBookingsByDate } from 'src/features/admin/booking/BookingApi'
import { TablesMap } from 'src/features/admin/floor-manager/components/TablesMap'
import { TablesMenu } from './TablesMenu'

/**
 * BookingsTableView
 * Renders tables on the map with booking information overlay.
 * Props:
 * - restaurantId: number (required)
 * - sectionId: number | null (optional)
 * - floorId: number | null (optional)
 * - date: string (YYYY-MM-DD) (optional)
 * - interval: { start_time: string, end_time: string } (optional)
 * - refreshKey: number (optional)
 * - onTablesLoaded: (tables) => void (optional) - Called when tables data is loaded
 * - onSelectionChange: (selectedIds) => void (optional) - Called when table selection changes
 * - initialSelectedIds: number[] (optional) - Initial selected table IDs
 * - highlightIds: number[] (optional) - IDs of tables to highlight
 * - onBookingsChange: (bookings) => void (optional) - Called when bookings data changes
 * - onEditBooking: (booking) => void (optional) - Called when a booking is edited
 * - onCreateBooking: (tableId) => void (optional) - Called when a new booking is created
 * - onCreateWalkIn: (tableId) => void (optional) - Called when a new walk-in booking is created
 * - onTableSwitch: (tableId) => void (optional) - Called when a table is switched
 * - onSwitchBooking: (booking) => void (optional) - Called when a booking is switched
 * - selectedTargetTableId: number (optional) - ID of the currently selected target table
 * - isTableMovementLocked: boolean (optional) - Whether table movement is locked
 */
export const BookingsTableView = ({ restaurantId, sectionId, floorId: floorIdProp, date: dateProp, interval, refreshKey = 0, onSelectionChange, initialSelectedIds = [], highlightIds = [], onBookingsChange, onEditBooking, onCreateBooking, onCreateWalkIn, onTableSwitch, onSwitchBooking, selectedTargetTableId, onTablesLoaded, isTableMovementLocked = false }) => {
  const [selectedIds, setSelectedIds] = React.useState([])
  const [hasRestored, setHasRestored] = React.useState(false)
  const [tableMenuAnchorEl, setTableMenuAnchorEl] = React.useState(null)
  const [selectedTable, setSelectedTable] = React.useState(null)
  const [menuPosition, setMenuPosition] = React.useState(null)
  const {
    state: { selectingTables, switchingTables, switchingBooking, bookingFilter },
    dispatch,
  } = useValue()

  // Initialize selection when entering booking mode with existing form data (only once)
  React.useEffect(() => {
    if (selectingTables && !hasRestored) {
      setSelectedIds(initialSelectedIds || [])
      setHasRestored(true)
    }
  }, [selectingTables, hasRestored, initialSelectedIds])

  // Clear selection when exiting booking mode
  React.useEffect(() => {
    if (!selectingTables) {
      setSelectedIds([])
      setHasRestored(false)
    } else {
      // Close table menu when entering selection mode
      setTableMenuAnchorEl(null)
      setSelectedTable(null)
    }
  }, [selectingTables])

  // Notify parent of selection changes (but only during selection mode)
  React.useEffect(() => {
    if (onSelectionChange && selectingTables) {
      onSelectionChange(selectedIds)
    }
  }, [selectedIds, onSelectionChange, selectingTables])

  const todayStr = React.useMemo(() => {
    // Use dateProp first, then bookingFilter.date, then today
    const dateToUse = dateProp || bookingFilter?.date
    const d = dateToUse ? dayjs(dateToUse) : dayjs()
    return d.isValid() ? d.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  }, [dateProp, bookingFilter?.date])

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables-by-restaurant', restaurantId, sectionId, todayStr, interval?.start_time, interval?.end_time],
    queryFn: () => getAllTablesByRestaurantId(restaurantId, { 
      section_id: sectionId ?? undefined, 
      date: todayStr,
      start_time: interval?.start_time,
      end_time: interval?.end_time,
    }),
    enabled: !!restaurantId && !!sectionId, // Only fetch when section is selected
    refetchOnWindowFocus: false,
    onError: (error) => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: error?.response?.data?.detail || 'Errore caricamento tavoli',
        },
      })
    },
  })

  console.log(interval)

  // Notify parent when tables data is loaded
  React.useEffect(() => {
    if (onTablesLoaded && tables.length > 0) {
      onTablesLoaded(tables)
    }
  }, [tables, onTablesLoaded])

  // Fetch bookings for the current date and time interval
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings-by-date', restaurantId, todayStr, interval?.start_time, interval?.end_time],
    queryFn: () => getBookingsByDate(restaurantId, {
      reservation_date: todayStr,
      start_time: interval?.start_time,
      end_time: interval?.end_time,
    }),
    enabled: !!restaurantId && !!todayStr && !!sectionId, // Only fetch when section is selected
    refetchOnWindowFocus: true,
    onError: (error) => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: error?.response?.data?.detail || 'Errore caricamento prenotazioni',
        },
      })
    },
  })

  // Group bookings by table_id for easier lookup
  // Filter out bookings with statuses that indicate the table is free
  const bookingsByTable = React.useMemo(() => {
    const grouped = {}
    const freeTableStatuses = ['no_show', 'completed', 'cancelled_by_restaurant', 'cancelled_by_user']
    
    bookings.forEach(booking => {
      // Skip bookings that indicate the table is free
      if (freeTableStatuses.includes(booking.status)) {
        return
      }
      
      if (booking.table_ids && Array.isArray(booking.table_ids)) {
        booking.table_ids.forEach(tableId => {
          if (!grouped[tableId]) grouped[tableId] = []
          grouped[tableId].push(booking)
        })
      }
    })
    return grouped
  }, [bookings])

  // Notify parent when bookings change
  React.useEffect(() => {
    if (onBookingsChange) {
      onBookingsChange(bookings)
    }
  }, [bookings, onBookingsChange])

  // Handle table click to show menu
  const handleTableClick = (tableId, event) => {
    
    if (selectingTables) {
      return // Don't show menu during table selection mode
    }

    if (switchingTables) {
      // In switching mode, just highlight the table but don't auto-select
      // User needs to manually confirm the selection
      onTableSwitch?.(tableId)
      return // Don't show menu during switching mode
    }
    
    const table = tables.find(t => t.id === tableId)
    
    if (!table) {
      return
    }
    
    // Get the canvas container (DOM element) and mouse position
    const stage = event.target.getStage()
    const canvasContainer = stage.container()
    const pointerPosition = stage.getPointerPosition()
  
    
    if (canvasContainer && pointerPosition && 
        typeof pointerPosition.x === 'number' && typeof pointerPosition.y === 'number') {
      const containerRect = canvasContainer.getBoundingClientRect()
      const newPosition = {
        top: containerRect.top + pointerPosition.y,
        left: containerRect.left + pointerPosition.x
      }
      setMenuPosition(newPosition)
      setSelectedTable(table)
      setTableMenuAnchorEl(canvasContainer)
    } else {
      console.log('ERROR: Invalid canvas container or pointer position')
    }
  }

  // Handle menu close
  const handleTableMenuClose = () => {
    setTableMenuAnchorEl(null)
    setSelectedTable(null)
  }

  // Use floorId from prop (from section data) or fallback to tables data
  const floorIdForMap = React.useMemo(() => {
    // Prefer floorId from section (passed as prop)
    if (floorIdProp) return floorIdProp
    // Fallback to floorId from tables data
    if (tables && tables.length > 0) return tables[0]?.floor_id ?? null
    return null
  }, [floorIdProp, tables])

  if (!sectionId) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Seleziona una sezione per visualizzare la mappa dei tavoli.
        </Typography>
      </Paper>
    )
  }

  // Show loading state only while tables are being fetched (we have floorId from section now)
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Caricamento tavoli...
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <Box sx={{ minWidth: 0 }}>
        <TablesMap
          key={`bookings-tables-map-${floorIdForMap}-${sectionId}-${refreshKey}`}
          tables={tables}
          floorId={floorIdForMap}
          sectionId={sectionId}
          isGrouping={selectingTables || switchingTables}
          selectedIds={selectedIds}
          highlightIds={highlightIds}
          switchingMode={switchingTables}
          switchingBooking={switchingBooking}
          selectedTargetTableId={selectedTargetTableId}
          bookingsByTable={bookingsByTable}
          onToggleSelect={(id) => {
            if (selectingTables) {
              setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
          }}
          onTableClick={handleTableClick}
          isTableMovementLocked={isTableMovementLocked}
          context="booking"
          restaurantId={restaurantId}
          currentDate={todayStr}
          currentInterval={interval}
          // No context menu for bookings
        />
      </Box>

      {/* Tables Menu */}
      <TablesMenu
        tableId={selectedTable?.id}
        tableName={selectedTable?.name || selectedTable?.table_number || selectedTable?.number}
        bookings={selectedTable ? (bookingsByTable[selectedTable.id] || []) : []}
        anchorEl={tableMenuAnchorEl}
        open={Boolean(tableMenuAnchorEl)}
        onClose={handleTableMenuClose}
        onEditBooking={onEditBooking}
        onCreateBooking={onCreateBooking}
        onCreateWalkIn={onCreateWalkIn}
        onSwitchBooking={onSwitchBooking}
        position={menuPosition}
        currentDate={dateProp}
        restaurantId={restaurantId}
        interval={interval}
        enabled={selectedTable?.enabled}
        enabled_online={selectedTable?.enabled_online}
      />
    </Box>
  )
}

//TablesMap
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Stage, Layer, Rect, Text, Circle, Group, Line, Shape } from 'react-konva'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import LoadingState from 'src/components/LoadingState'
import { getFloorById, updateTablePosition, getElementsByFloor, updateElementPosition } from 'src/features/admin/floor-manager/floorManagerApi'
import { updatePositionOverrides } from 'src/features/admin/booking/BookingApi'
import { getBookingStatusColor } from 'src/features/admin/booking/constants/bookingStatusColors'
import { renderBush } from 'src/features/admin/floor-manager/styles/bush.jsx'
import { renderTree } from 'src/features/admin/floor-manager/styles/tree.jsx'
import { renderVase } from 'src/features/admin/floor-manager/styles/vase.jsx'
import { renderDoor } from 'src/features/admin/floor-manager/styles/door.jsx'
import { renderWindowEl } from 'src/features/admin/floor-manager/styles/window.jsx'
import { renderStairs } from 'src/features/admin/floor-manager/styles/stairs.jsx'
import { renderBox } from 'src/features/admin/floor-manager/styles/box.jsx'

/**
 * TablesMap
 * Props:
 * - floorId: number (required)
 * - tables: Array<Table> (required)
 * - gridSize: number (optional, default 10)
 * - onPositionChange: (tableId, { position_x, position_y }) => void (optional)
 * - isTableMovementLocked: boolean (optional) - disables table dragging when true
 * - context: 'booking' | 'floor' (optional) - determines which API to use for position updates
 * - restaurantId: number (optional) - required when context is 'booking'
 * - currentDate: string (optional) - required when context is 'booking' (YYYY-MM-DD format)
 * - currentInterval: object (optional) - required when context is 'booking' ({ start_time, end_time })
 */
export const TablesMap = ({
  floorId,
  sectionId = null,
  tables = [],
  gridSize = 10,
  onPositionChange,
  isGrouping = false,
  selectedIds = [],
  onToggleSelect,
  onContextMenu,
  highlightIds = [],
  onElementContextMenu,
  refreshKey = 0,
  bookingsByTable = {},
  onTableClick,
  switchingMode = false,
  switchingBooking = null,
  selectedTargetTableId = null,
  isTableMovementLocked = false,
  context = 'floor',
  restaurantId = null,
  currentDate = null,
  currentInterval = null,
}) => {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const { data: floor, isLoading: isFloorLoading } = useQuery({
    queryKey: ['floor', floorId, refreshKey],
    queryFn: () => getFloorById(floorId),
    enabled: !!floorId,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  // Elements on this floor/section
  const { data: elements = [] } = useQuery({
    queryKey: ['elements', floorId, sectionId, refreshKey],
    queryFn: () => getElementsByFloor(floorId, { section_id: sectionId ?? undefined }),
    enabled: !!floorId,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const width = Number(floor?.width) || 800
  const height = Number(floor?.height) || 800
  // Use theme-aware background color in dark mode, custom color in light mode
  const bgColor = theme.palette.mode === 'dark' 
    ? theme.palette.grey[800] 
    : (floor?.style?.color || '#f5f5f5')
  const tileStyle = floor?.style?.tileStyle || 'square'
  const snap = Number(floor?.style?.tileSize ?? floor?.style?.gridSize ?? gridSize ?? 10) || 10
  const tableFillColor = floor?.style?.tableColor || '#90caf9'
  const canInteract = !!sectionId
  const [draggingId, setDraggingId] = React.useState(null)
  const [draggingElementId, setDraggingElementId] = React.useState(null)

  // Mutation to persist position updates
  const positionMutation = useMutation({
    mutationFn: ({ id, payload }) => {
      if (context === 'booking' && restaurantId && currentDate) {
        // Use position overrides API for booking context
        
        // If no interval is selected (e.g., "Tutti" is selected), we can't create position overrides
        // because they need to be tied to specific time ranges
        if (!currentInterval) {
          console.warn('Cannot create position overrides without a specific time interval. Please select a time range instead of "Tutti".')
          throw new Error('Please select a specific time range to move tables. Position overrides cannot be created for "All" time periods.')
        }
        
        // Extract time from the interval (format: "HH:MM:SS" -> "HH:MM")
        const formatTime = (timeStr) => {
          if (!timeStr) return null
          return timeStr.slice(0, 5) // "19:00:00" -> "19:00"
        }
        
        const startTime = formatTime(currentInterval.start_time)
        const endTime = formatTime(currentInterval.end_time)
        
        // Only proceed if we have valid time ranges
        if (!startTime || !endTime) {
          console.warn('Invalid time range for position override:', { currentInterval, startTime, endTime })
          throw new Error('Invalid time range. Please select a valid time interval.')
        }
        
        const overridePayload = {
          restaurant_id: restaurantId,
          table_id: id,
          reservation_date: currentDate,
          start_time: startTime,
          end_time: endTime,
          x_position: payload.position_x,
          y_position: payload.position_y,
        }
        return updatePositionOverrides(overridePayload)
      } else {
        // Use regular table position API for floor management context
        return updateTablePosition(id, payload)
      }
    },
    onSuccess: () => {
      if (context === 'booking') {
        // refresh tables for booking context
        queryClient.invalidateQueries(['tables-by-restaurant', restaurantId, sectionId, currentDate])
      } else {
        // refresh tables for floor management context
        queryClient.invalidateQueries(['tables', floorId, sectionId])
      }
    },
  })

  // Compute initial positions for tables without coordinates
  const initialPositions = React.useMemo(() => {
    const positions = {}
    let cursorX = snap * 2
    let cursorY = snap * 2
    const maxX = width - snap * 2
    tables.forEach((t) => {
      let x = Number(t.position_x)
      let y = Number(t.position_y)
      if (x == null || y == null || Number.isNaN(x) || Number.isNaN(y)) {
        // Auto place in a simple flowing grid
        x = cursorX
        y = cursorY
        const twAuto = Number(t.width) || snap
        const thAuto = Number(t.height) || snap
        cursorX += twAuto + snap
        if (cursorX > maxX) {
          cursorX = snap * 2
          cursorY += thAuto + snap
        }

      }
      positions[t.id] = { x, y }
    })
    return positions
  }, [tables, width, snap])

  // Default sizes per element type for display fallback (top-down representation)
  const ELEMENT_DEFAULTS = {
    bush: { width: 24, height: 24 },
    tree: { width: 40, height: 40 },
    vase: { width: 20, height: 20 },
    door: { width: 80, height: 8 },
    window: { width: 80, height: 6 },
    stairs: { width: 60, height: 24 },
    box: { width: 30, height: 30 },
  }

  const renderElement = (el) => {
    const t = (el?.type || '').toLowerCase()
    const def = ELEMENT_DEFAULTS[t] || { width: snap, height: snap }
    const ew = Number(el?.width) || def.width
    const eh = Number(el?.height) || def.height
    const ex = Number(el?.position_x) 
    const ey = Number(el?.position_y)
    const rot = Number(el?.rotation) || 0
    // Elements use their own color; if unset or neutral grey, provide greenish defaults for bush/tree
    const pickColor = (type, elColor) => {
      if (elColor && elColor !== '#9e9e9e') return elColor
      if (type === 'tree') return '#2E7D32'
      if (type === 'bush') return '#4CAF50'
      return elColor || '#9e9e9e'
    }
    const color = pickColor(t, el?.color)
    const MARGIN = 2
    const safeX = Math.max(MARGIN, Math.min(ex, width - ew - MARGIN))
    const safeY = Math.max(MARGIN, Math.min(ey, height - eh - MARGIN))

    const innerProps = { x: 0, y: 0, width: ew, height: eh, rotation: rot, color, tableFillColor: color }
    let inner
    switch (t) {
      case 'bush':
        inner = renderBush(innerProps); break
      case 'tree':
        inner = renderTree(innerProps); break
      case 'vase':
        inner = renderVase(innerProps); break
      case 'door':
        inner = renderDoor(innerProps); break
      case 'window':
        inner = renderWindowEl(innerProps); break
      case 'stairs':
        inner = renderStairs(innerProps); break
      case 'box':
      default:
        inner = renderBox(innerProps); break
    }
    // Long-press support for element context menu (mobile)
    let pressTimer
    const startPress = (e) => {
      if (!canInteract) return
      const touch = e.evt?.touches?.[0]
      const clientX = touch?.clientX ?? e.evt?.clientX ?? 0
      const clientY = touch?.clientY ?? e.evt?.clientY ?? 0
      clearTimeout(pressTimer)
      pressTimer = setTimeout(() => {
        if (typeof onElementContextMenu === 'function') onElementContextMenu(el, { clientX, clientY })
      }, 550)
    }
    const cancelPress = () => clearTimeout(pressTimer)

    // Determine cursor for elements - only show pointer in floor management context
    const elementTargetCursor = (context === 'floor' && canInteract) ? 'pointer' : (canInteract ? 'grab' : 'default')

    const handleElementMouseEnter = (e) => {
      const stage = e.target.getStage()
      if (stage) {
        stage.container().style.cursor = elementTargetCursor
      }
    }

    const handleElementMouseLeave = (e) => {
      const stage = e.target.getStage()
      if (stage) {
        stage.container().style.cursor = 'default'
      }
    }

    return (
      <Group
        key={`el-${el.id}`}
        x={safeX}
        y={safeY}
        draggable={canInteract}
        dragBoundFunc={elementDragBound({ ...el, width: ew, height: eh })}
        onDragStart={() => setDraggingElementId(el.id)}
        onDragEnd={(e) => handleElementDragEnd(el, e)}
        onContextMenu={(e) => {
          if (!canInteract) return
          e.evt?.preventDefault?.()
          const clientX = e.evt?.clientX ?? 0
          const clientY = e.evt?.clientY ?? 0
          if (typeof onElementContextMenu === 'function') onElementContextMenu(el, { clientX, clientY })
        }}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
        onMouseEnter={handleElementMouseEnter}
        onMouseLeave={handleElementMouseLeave}
        transformsEnabled="position"
      >
        {inner}
      </Group>
    )
  }

  // Element dragging: bounds, snapping, and persistence
  const elementDragBound = (el) => (pos) => {
    const ew = Number(el.width) || ELEMENT_DEFAULTS[(el?.type || '').toLowerCase()]?.width || snap
    const eh = Number(el.height) || ELEMENT_DEFAULTS[(el?.type || '').toLowerCase()]?.height || snap
    const MARGIN = 2
    const maxX = Math.max(MARGIN, width - ew - MARGIN)
    const maxY = Math.max(MARGIN, height - eh - MARGIN)
    const x = Math.max(MARGIN, Math.min(pos.x, maxX))
    const y = Math.max(MARGIN, Math.min(pos.y, maxY))
    return { x, y }
  }

  const snapValue = (v) => Math.round(v / snap) * snap

  const handleElementDragEnd = (el, e) => {
    const node = e.target
    const snappedX = snapValue(node.x())
    const snappedY = snapValue(node.y())
    node.position({ x: snappedX, y: snappedY })
    // Persist element position (using non-default position by default)
    updateElementPosition(el.id, { position_x: snappedX, position_y: snappedY, is_default: false })
    queryClient.invalidateQueries(['elements', floorId, sectionId])
    setDraggingElementId(null)
  }

  const [positions, setPositions] = React.useState(initialPositions)
  React.useEffect(() => setPositions(initialPositions), [initialPositions])

  

  const clampToBounds = (table, x, y) => {
    const tw = Number(table.width) || snap
    const th = Number(table.height) || snap
    const maxX = Math.max(0, width - tw)
    const maxY = Math.max(0, height - th)
    const nx = Math.max(0, Math.min(x, maxX))
    const ny = Math.max(0, Math.min(y, maxY))
    return { x: nx, y: ny }
  }

  const handleDragEnd = (table, e) => {
    const node = e.target
    const snappedX = Math.round(node.x() / snap) * snap
    const snappedY = Math.round(node.y() / snap) * snap
    const { x: newX, y: newY } = clampToBounds(table, snappedX, snappedY)
    node.position({ x: newX, y: newY })
    setPositions((prev) => ({ ...prev, [table.id]: { x: newX, y: newY } }))
    onPositionChange?.(table.id, { position_x: newX, position_y: newY })
    // Persist
    positionMutation.mutate({ id: table.id, payload: { position_x: newX, position_y: newY } })
    setDraggingId(null)
  }

  const dragBound = (table) => (pos) => {
    const tw = Number(table.width) || snap
    const th = Number(table.height) || snap
    const MARGIN = 2 // inner margin to avoid overlapping inner border lines
    const maxX = Math.max(MARGIN, width - tw - MARGIN)
    const maxY = Math.max(MARGIN, height - th - MARGIN)
    const x = Math.max(MARGIN, Math.min(pos.x, maxX))
    const y = Math.max(MARGIN, Math.min(pos.y, maxY))
    return { x, y }
  }

  // Contrast helpers (matching SectionAbout style)
  const getLuminance = (r, g, b) => {
    const toLin = (c) => {
      const v = c / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    }
    const rs = toLin(r)
    const gs = toLin(g)
    const bs = toLin(b)
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const getContrastColor = (hexcolor) => {
    if (!hexcolor) return 'rgba(255, 255, 255, 0.9)'
    const h = hexcolor.replace('#', '')
    if (h.length !== 6) return 'rgba(255, 255, 255, 0.9)'
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    const luminance = getLuminance(r, g, b)
    return luminance > 0.5 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'
  }

  // Adaptive grid stroke from bg color using contrast color, but toned down (lower alpha)
  const calcGridStroke = (hex) => {
    const contrast = getContrastColor(hex)
    if (contrast.startsWith('rgba(0, 0, 0')) {
      // dark stroke for light backgrounds -> make it subtle
      return 'rgba(0,0,0,0.16)'
    }
    // light stroke for dark backgrounds
    return 'rgba(255,255,255,0.2)'
  }

  const renderGrid = () => {
    const lines = []
    const stroke = calcGridStroke(bgColor)
    if (tileStyle === 'square') {
      for (let i = 0; i <= width; i += snap) {
        lines.push(
          <Line key={`v-${i}`} points={[Number(i), 0, Number(i), Number(height)]} stroke={stroke} strokeWidth={1} />
        )
      }
      for (let j = 0; j <= height; j += snap) {
        lines.push(
          <Line key={`h-${j}`} points={[0, Number(j), Number(width), Number(j)]} stroke={stroke} strokeWidth={1} />
        )
      }
      return lines
    }
    // default fallback: same as square
    for (let i = 0; i <= width; i += snap) {
      lines.push(
        <Line key={`v-${i}`} points={[Number(i), 0, Number(i), Number(height)]} stroke={stroke} strokeWidth={1} />
      )
    }
    for (let j = 0; j <= height; j += snap) {
      lines.push(
        <Line key={`h-${j}`} points={[0, Number(j), Number(width), Number(j)]} stroke={stroke} strokeWidth={1} />
      )
    }
    return lines
  }

  const renderTable = (t) => {
    const MARGIN = 2
    const pos = positions[t.id] || { x: Math.max(MARGIN, snap * 2), y: Math.max(MARGIN, snap * 2) }
    const shape = t.shape || 'square'
    const tw = Number(t.width) || snap
    const th = Number(t.height) || snap
    const rotation = Number(t.rotation) || 0

    const isSelected = selectedIds?.includes?.(t.id)
    const isHighlighted = highlightIds?.includes?.(t.id)
    
    // Special styling for switching mode
    let commonStroke = '#424242'
    let commonStrokeWidth = 1
    
    if (switchingMode) {
      if (switchingBooking && switchingBooking.table_ids && switchingBooking.table_ids.includes(t.id)) {
        commonStroke = '#ff9800' // Orange stroke for source table (locked)
        commonStrokeWidth = 3
      } else if (selectedTargetTableId === t.id) {
        commonStroke = '#4caf50' // Green stroke for selected target table
        commonStrokeWidth = 3
      } else {
        // Normal stroke for unselected tables - they look normal until clicked
        commonStroke = '#424242'
        commonStrokeWidth = 1
      }
    } else if (isSelected) {
      commonStroke = '#1976d2'
      commonStrokeWidth = 2
    } else if (isHighlighted) {
      commonStroke = '#ff9800'
      commonStrokeWidth = 2
    }
    // Determine cursor based on context, mode and table state
    let targetCursor = 'default'
    if (isGrouping) {
      if (t.enabled === false) {
        targetCursor = 'not-allowed' // Disabled tables are not selectable
      } else if (switchingMode && switchingBooking && switchingBooking.table_ids && switchingBooking.table_ids.includes(t.id)) {
        targetCursor = 'not-allowed' // Source table is locked
      } else {
        targetCursor = 'pointer' // Other tables are clickable
      }
    } else if (context === 'booking') {
      // In booking context, show pointer hand when hovering over tables
      targetCursor = 'pointer'
    } else if (context === 'floor' && canInteract) {
      // In floor management context, show pointer hand when hovering over tables
      targetCursor = 'pointer'
    } else if (canInteract && !isTableMovementLocked) {
      // Show grab cursor for draggable tables
      targetCursor = 'grab'
    }

    // Get bookings for this table
    const tableBookings = bookingsByTable[t.id] || []
    const hasBookings = tableBookings.length > 0
    const hasMultipleBookings = tableBookings.length > 1

    // Determine table fill color based on booking status and mode
    let tableFill = tableFillColor
    
    // First, check for blocking states (highest priority after switching mode)
    if (t.enabled === false) {
      // Table is completely blocked (all reservations)
      tableFill = '#424242' // Almost black
    } else if (t.enabled_online === false) {
      // Table is blocked for online reservations only
      tableFill = '#bdbdbd' // Greyed out
    } else if (switchingMode) {
      // In switching mode, only highlight source table and selected target
      if (switchingBooking && switchingBooking.table_ids && switchingBooking.table_ids.includes(t.id)) {
        tableFill = '#ff9800' // Orange for source table (locked)
      } else if (selectedTargetTableId === t.id) {
        tableFill = '#c8e6c9' // Light green for selected target table
      } else {
        // Normal colors for unselected tables - they look normal until clicked
        if (hasBookings) {
          tableFill = getBookingStatusColor(tableBookings[0].status)
        } else {
          tableFill = tableFillColor
        }
      }
    } else if (hasBookings) {
      tableFill = getBookingStatusColor(tableBookings[0].status)
    }

    const handleClick = (e) => {
      // Prevent selection of completely blocked tables during reservation creation
      if (isGrouping && t.enabled === false) {
        return // Don't allow clicking on disabled tables
      }
      
      if (isGrouping) {
        if (switchingMode) {
          // Switching mode - check if it's the source table (locked)
          if (switchingBooking && switchingBooking.table_ids && switchingBooking.table_ids.includes(t.id)) {
            return // Don't allow clicking on source table
          }
          
          // For switching mode, call onTableClick to handle the selection
          if (typeof onTableClick === 'function') {
            onTableClick(t.id, e)
          }
          return
        }
        
        // Regular table selection mode - only handle selection
        if (typeof onToggleSelect === 'function') {
          onToggleSelect(t.id)
        }
        return
      }

      // Regular table click - show context menu or handle click
      if (typeof onTableClick === 'function') {
        onTableClick(t.id, e)
      } 
    }

    const handleContextMenu = (e) => {
      if (isGrouping) return
      e.evt?.preventDefault?.()
      const clientX = e.evt?.clientX ?? 0
      const clientY = e.evt?.clientY ?? 0
      if (typeof onContextMenu === 'function') onContextMenu(t, { clientX, clientY })
    }

    const handleMouseEnter = (e) => {
      const stage = e.target.getStage()
      if (stage) {
        stage.container().style.cursor = targetCursor
      }
    }

    const handleMouseLeave = (e) => {
      const stage = e.target.getStage()
      if (stage) {
        stage.container().style.cursor = 'default'
      }
    }

    // Long press support for mobile to open context menu
    let pressTimer
    const startPress = (e) => {
      if (isGrouping) return
      const touch = e.evt?.touches?.[0]
      const clientX = touch?.clientX ?? e.evt?.clientX ?? 0
      const clientY = touch?.clientY ?? e.evt?.clientY ?? 0
      clearTimeout(pressTimer)
      pressTimer = setTimeout(() => {
        if (typeof onContextMenu === 'function') onContextMenu(t, { clientX, clientY })
      }, 550)
    }
    const cancelPress = () => {
      clearTimeout(pressTimer)
    }

    return (
      <Group
        key={t.id}
        x={pos.x}
        y={pos.y}
        draggable={canInteract && !isGrouping && !isTableMovementLocked}
        dragBoundFunc={dragBound(t)}
        transformsEnabled="position"
        dragDistance={2}
        onDragStart={() => setDraggingId(t.id)}
        onDragEnd={(e) => handleDragEnd(t, e)}
        onClick={handleClick}
        onTap={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
        onMouseDown={cancelPress}
        onMouseUp={cancelPress}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        listening
        opacity={1}
        shadowForStrokeEnabled={false}
        perfectDrawEnabled={false}
        draggableOnClick={false}
      >
        {shape === 'circle' ? (
          <>
            <Circle
              radius={tw / 2}
              x={tw / 2}
              y={th / 2}
              fill={tableFill}
              stroke={commonStroke}
              strokeWidth={commonStrokeWidth}
              perfectDrawEnabled={false}
              onContextMenu={handleContextMenu}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              onTouchMove={cancelPress}
            />
            {/* Diagonal split for multiple bookings on circles */}
            {hasMultipleBookings && (
              <>
                {/* Bottom half circle for second booking */}
                <Shape
                  sceneFunc={(context, shape) => {
                    context.beginPath()
                    context.arc(tw / 2, th / 2, tw / 2, 0, Math.PI, false)
                    context.closePath()
                    context.fillStrokeShape(shape)
                  }}
                  fill={getBookingStatusColor(tableBookings[1].status)}
                  stroke={commonStroke}
                  strokeWidth={commonStrokeWidth}
                />
                <Line
                  points={[0, th / 2, tw, th / 2]}
                  stroke={commonStroke}
                  strokeWidth={1}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Rect
              width={tw}
              height={th}
              rotation={rotation}
              offset={{ x: 0, y: 0 }}
              cornerRadius={shape === 'square' ? 2 : 2}
              fill={tableFill}
              stroke={commonStroke}
              strokeWidth={commonStrokeWidth}
              perfectDrawEnabled={false}
              onContextMenu={handleContextMenu}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              onTouchMove={cancelPress}
            />
            {/* Diagonal split for multiple bookings on rectangles */}
            {hasMultipleBookings && (
              <>
                {/* Bottom-right triangle for second booking */}
                <Shape
                  sceneFunc={(context, shape) => {
                    context.beginPath()
                    context.moveTo(0, th)
                    context.lineTo(tw, th)
                    context.lineTo(tw, 0)
                    context.closePath()
                    context.fillStrokeShape(shape)
                  }}
                  fill={getBookingStatusColor(tableBookings[1].status)}
                  stroke={commonStroke}
                  strokeWidth={0}
                />
                <Line
                  points={[0, th, tw, 0]}
                  stroke={commonStroke}
                  strokeWidth={1}
                />
              </>
            )}
          </>
        )}
        {/* Labels hidden during drag to reduce draw work */}
        {draggingId !== t.id && (() => {
          const fs = 9
          const lineHeight = 11
          
          if (hasBookings) {
            // Show booking info for first booking
            const booking = tableBookings[0]
            const customerName = booking.name || 'N/A'
            const arrivalTime = booking.arrival_time ? booking.arrival_time.slice(0, 5) : 'N/A'
            const totalPax = (booking.adults || 0) + (booking.children || 0)
            
            // First row: table number and pax
            const tableNumStr = `${t.number ?? ''} (${totalPax}p)`
            // Second row: arrival time
            const timeStr = arrivalTime
            // Third row: customer name
            const nameStr = customerName.length > 10 ? customerName.slice(0, 10) + '...' : customerName
            
            const approx = (s) => s.length * fs * 0.55
            const tableNumWidth = approx(tableNumStr)
            const timeWidth = approx(timeStr)
            const nameWidth = approx(nameStr)
            
            // Center all text as a block
            const totalHeight = lineHeight * 3
            const startY = Math.max(0, (th - totalHeight) / 2)
            
            return (
              <Group>
                <Text 
                  text={tableNumStr} 
                  fontSize={fs} 
                  fontStyle="bold" 
                  x={Math.max(0, (tw - tableNumWidth) / 2)} 
                  y={startY} 
                  fill={getContrastColor(tableFill)} 
                  listening={false} 
                />
                <Text 
                  text={timeStr} 
                  fontSize={fs} 
                  x={Math.max(0, (tw - timeWidth) / 2)} 
                  y={startY + lineHeight} 
                  fill={getContrastColor(tableFill)} 
                  listening={false} 
                />
                <Text 
                  text={nameStr} 
                  fontSize={fs} 
                  x={Math.max(0, (tw - nameWidth) / 2)} 
                  y={startY + lineHeight * 2} 
                  fill={getContrastColor(tableFill)} 
                  listening={false} 
                />
              </Group>
            )
          } else {
            // Show table number and capacity as before
            const numStr = `${t.number ?? ''}`
            const paxStr = `(${t.max_capacity ?? ''})`
            const approx = (s) => s.length * fs * 0.6
            const spacing = 4
            const total = approx(numStr) + spacing + approx(paxStr)
            const startX = Math.max(0, (tw - total) / 2)
            const y = Math.max(0, (th - fs) / 2)
            return (
              <Group>
                <Text text={numStr} fontSize={fs} fontStyle="bold" x={startX} y={y} fill="#212121" listening={false} />
                <Text text={paxStr} fontSize={fs} x={startX + approx(numStr) + spacing} y={y} fill="#212121" listening={false} />
              </Group>
            )
          }
        })()}
      </Group>
    )
  }

  const gridLayerRef = React.useRef(null)
  React.useEffect(() => {
    if (gridLayerRef.current) {
      gridLayerRef.current.cache()
    }
  }, [width, height, snap, bgColor, tileStyle])

  // Scale stage to available width to avoid overflow
  const containerRef = React.useRef(null)
  const [scale, setScale] = React.useState(1)
  React.useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || !floor || !width) return
    
    const compute = () => {
      const cw = el.clientWidth || width
      const H_PADDING = 24 // Box sx p:1.5 -> 12px per side => 24 total
      const available = Math.max(1, cw - H_PADDING)
      const s = Math.min(1, available / Math.max(1, width))
      setScale(s)
    }
    
    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(compute, 0)
    
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    
    return () => {
      clearTimeout(timeoutId)
      ro.disconnect()
    }
  }, [width, floor])

  const styledWidth = width * scale
  const styledHeight = height * scale

  // Show loading skeleton while floor data is loading
  if (isFloorLoading || !floor) {
    const skeletonWidth = width || 800
    const skeletonHeight = height || 600
    const skeletonStyledWidth = skeletonWidth * scale
    const skeletonStyledHeight = skeletonHeight * scale

    return (
      <Box
        ref={containerRef}
        sx={{ 
          p: 1.5, 
          backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#d5d5d5', 
          borderRadius: 1, 
          maxWidth: '100%', 
          overflow: 'hidden', 
          width: '100%'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: `${skeletonStyledWidth}px`,
            height: `${skeletonStyledHeight}px`,
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height="100%"
            sx={{ 
              borderRadius: 1,
              backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#e0e0e0',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
          <LoadingState size={16} spacing={2} />
        </Box>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      sx={{ 
        p: 1.5, 
        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#d5d5d5', 
        borderRadius: 1, 
        maxWidth: '100%', 
        overflow: 'hidden', 
        width: '100%' 
      }}
    >
      <Stage
        width={width}
        height={height}
        scaleX={scale}
        scaleY={scale}
        pixelRatio={window.devicePixelRatio || 1}
        style={{
          background: 'transparent',
          // Set content box size to scaled content; border will render around it
          width: `${styledWidth}px`,
          height: `${styledHeight}px`,
        }}
      >
        <Layer ref={gridLayerRef} listening={false}>
          {/* Background floor rect for color fill (rendered beneath grid lines) */}
          <Rect x={0} y={0} width={width} height={height} fill={bgColor} />
          {renderGrid()}
          {/* Pixel-perfect inner border on half-pixel to ensure consistent 1px thickness at all scales */}
          <Line points={[0.5, 0.5, width - 0.5, 0.5]} stroke={'rgba(0,0,0,0.35)'} strokeWidth={1} />
          <Line points={[0.5, 0.5, 0.5, height - 0.5]} stroke={'rgba(0,0,0,0.35)'} strokeWidth={1} />
          <Line points={[0.5, height - 0.5, width - 0.5, height - 0.5]} stroke={'rgba(0,0,0,0.35)'} strokeWidth={1} />
          <Line points={[width - 0.5, 0.5, width - 0.5, height - 0.5]} stroke={'rgba(0,0,0,0.35)'} strokeWidth={1} />
        </Layer>
        {/* Elements layer (draggable like tables when interactive) */}
        <Layer listening={canInteract && !isGrouping}>
          {Array.isArray(elements) && elements.map(renderElement)}
        </Layer>
        <Layer listening={canInteract}>
          {(tables || []).map(renderTable)}
        </Layer>
        {!canInteract && (
          <Layer listening={false}>
            <Rect x={0} y={0} width={width} height={height} fill="#ffffff" opacity={0.2} />
            <Text
              text={'Seleziona una sezione per modificare la mappa'}
              fontSize={16}
              fill="#424242"
              x={width / 2 - 180}
              y={height / 2 - 10}
            />
          </Layer>
        )}
      </Stage>
    </Box>
  )
}

//TablesMenu
import React from 'react'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import dayjs from 'dayjs'
import { getBookingStatusColor, BOOKING_STATUS_LABELS } from '../constants/bookingStatusColors'
import { ChangeReservationStatus } from './ChangeReservationStatus'
import { BlockTable } from './BlockTable'
import { useValue } from 'src/context/ContextProvider'

/**
 * TablesMenu
 * A menu that appears when clicking on a table in the canvas
 * Shows all reservations attached to that table
 * Props:
 * - tableId: The table ID
 * - tableName: The table name/number
 * - bookings: Array of booking objects for this table
 * - anchorEl: The element to anchor the menu to
 * - open: Whether the menu is open
 * - onClose: () => void - Called when menu closes
 * - onEditBooking: (booking) => void - Called when edit is requested for a booking
 * - restaurantId: number - Restaurant ID for block operations
 * - interval: { start_time: string, end_time: string } - Current time interval
 */
export const TablesMenu = ({ tableId, tableName, bookings = [], anchorEl, open, onClose, onEditBooking, position, onCreateBooking, onCreateWalkIn, currentDate, onSwitchBooking, restaurantId, interval, enabled, enabled_online }) => {
  const { state: { bookingFilter } } = useValue()
  // Quick status options to show as chips
  const quickStatusOptions = ['confirmed', 'completed', 'seated', 'bill', 'cancelled_by_user', 'no_show']

  if (!tableId) return null

  const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.slice(0, 5) // HH:mm
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }
  console.log(currentDate)


  // Check if current date is today
  const isToday = currentDate && dayjs(currentDate).isSame(dayjs(), 'day')

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorReference={position ? "anchorPosition" : "anchorEl"}
      anchorPosition={position && position.top !== undefined && position.left !== undefined ? 
        { top: position.top, left: position.left } : 
        undefined
      }
      transformOrigin={{ horizontal: 'left', vertical: 'center' }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 360,
            maxWidth: 400,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: -8,
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '8px 8px 8px 0',
              borderColor: 'transparent #fff transparent transparent',
              filter: 'drop-shadow(-2px 0 4px rgba(0,0,0,0.1))',
              zIndex: 1
            }
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
            🪑 Tavolo {tableName || tableId}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ p: 0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
          {bookings.length === 0 ? 'Nessuna prenotazione' : `${bookings.length} prenotazione${bookings.length > 1 ? 'i' : ''}`}
        </Typography>
      
        {/* Action Buttons */}
        {(restaurantId || bookingFilter?.restaurant_id) && currentDate && interval && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              onCreateBooking?.(tableId)
              onClose()
            }}
            sx={{ 
              fontSize: '0.7rem',
              flex: 1,
              height: 28
            }}
          >
            Nuova Prenotazione
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            disabled={!isToday}
            onClick={() => {
              onCreateWalkIn?.(tableId)
              onClose()
            }}
            sx={{ 
              fontSize: '0.7rem',
              flex: 1,
              height: 28
            }}
            title={!isToday ? 'Walk-In disponibile solo per oggi' : ''}
          >
            Walk-In
          </Button>
        </Box>
        )}

        {/* Block Table Actions */}
        {(restaurantId || bookingFilter?.restaurant_id) && currentDate && interval && (
          <>
 
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <BlockTable
                restaurant_id={restaurantId || bookingFilter?.restaurant_id}
                reservation_date={currentDate}
                start_time={interval.start_time}
                end_time={interval.end_time}
                table_id={tableId}
                block_online_only={true}
                onSuccess={onClose}
                enabled={enabled}
                enabled_online={enabled_online}
              />
              <BlockTable
                restaurant_id={restaurantId || bookingFilter?.restaurant_id}
                reservation_date={currentDate}
                start_time={interval.start_time}
                end_time={interval.end_time}
                table_id={tableId}
                block_online_only={false}
                onSuccess={onClose}
                enabled={enabled}
                enabled_online={enabled_online}
              />
            </Box>

            {/* Action Buttons */}
            {bookings.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt:1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    if (bookings[0]) {
                      onEditBooking?.(bookings[0])
                      onClose()
                    }
                  }}
                  sx={{ 
                    fontSize: '0.7rem',
                    flex: 1,
                    height: 28
                  }}
                >
                  Modifica
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  startIcon={<SwapHorizIcon />}
                  onClick={() => {
                    if (bookings[0]) {
                      onSwitchBooking?.(bookings[0])
                      onClose()
                    }
                  }}
                  sx={{ 
                    fontSize: '0.7rem',
                    flex: 1,
                    height: 28
                  }}
                >
                  Sposta
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {bookings.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Tavolo libero
          </Typography>
        </Box>
      ) : (
        <>
          <Divider />
          
          {/* Bookings List */}
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {bookings.map((booking, index) => (
              <React.Fragment key={booking.id}>
                <Box sx={{ p: 1.5 }}>
                  {/* Booking Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {booking.name} {booking.surname}
                      </Typography>
                      {/* Status change chips with current status first */}
                      <Box sx={{ mt: 0.5 }}>
                        <ChangeReservationStatus 
                          booking={booking}
                          size="small"
                          statusOptions={quickStatusOptions}
                          onStatusChange={() => {
                            // Status change handled internally by the component
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Booking Details */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      📅 {formatDate(booking.reservation_date)} • ⏰ {formatTime(booking.arrival_time)}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      👥 {(booking.adults || 0) + (booking.children || 0)} persone
                    </Typography>
                    {/* Accessibility items: highchairs and wheelchairs */}
                    {(Number(booking.highchair_number) > 0 || Number(booking.wheelchair_number) > 0) && (
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        {Number(booking.highchair_number) > 0 && `🧒 Seggioloni: ${booking.highchair_number}`}
                        {Number(booking.highchair_number) > 0 && Number(booking.wheelchair_number) > 0 && ' • '}
                        {Number(booking.wheelchair_number) > 0 && `♿ Sedie a rotelle: ${booking.wheelchair_number}`}
                      </Typography>
                    )}
                
                    {booking.phone && (
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        📞 {booking.phone}
                      </Typography>
                    )}
                        {/* Payment info: show when a deposit/amount exists or status present */}
                        {(booking.amount > 0 || booking.payment_status) && (
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        💳 Deposito{booking.amount > 0 ? `: €${Number(booking.amount).toFixed(2)}` : ''}
                        {booking.payment_status ? ` • Stato: ${booking.payment_status}` : ''}
                      </Typography>
                    )}
                    {booking.costumer_notes && (
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        <strong>Cliente:</strong> {booking.costumer_notes}
                      </Typography>
                    )}
                    {booking.restaurant_notes && (
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block' }}>
                        <strong>Ristorante:</strong> {booking.restaurant_notes}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* Divider between bookings (except last) */}
                {index < bookings.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        </>
      )}
    </Popover>
  )
}

