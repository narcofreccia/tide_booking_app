# Voice Booking - Frontend Integration Guide

## Overview

Voice booking allows staff to create bookings by speaking. The backend **automatically creates a PENDING booking** when all required information is extracted from the voice transcript.

### ✨ AI-Powered Extraction
The backend uses **OpenAI GPT-4o-mini** to intelligently extract booking information from transcripts in **any language** (Italian, English, French, German, Spanish, etc.). It handles:
- ✅ Relative dates: "oggi", "domani", "stasera", "tonight", "demain"
- ✅ Time conversion: "8pm" → "20:00"
- ✅ Adults + children separation: "2 adulti e 1 bambino"
- ✅ Special requests: allergies, preferences, accessibility
- ✅ Highchairs and wheelchair needs
- ✅ Phone numbers (optional)

## Flow Summary

```
1. Staff speaks → "Tavolo per 4 alle 20:00 per Mario Rossi"
2. Frontend sends transcript to backend
3. Backend AI extracts info + creates PENDING booking
4. Frontend receives booking_id + booking object
5. Frontend shows modal with booking details
6. Staff reviews and confirms/edits
7. Frontend updates booking to "confirmed" status
```

## API Endpoints

### 1. Create Voice Intent (Creates Pending Booking)

**Endpoint:** `POST /voice-intents/`

**Request (High Confidence - Transcript Only):**
```javascript
const formData = new FormData();
formData.append('transcript', 'Tavolo per 4 alle 20:00 per Mario Rossi');
formData.append('locale', 'it-IT');
formData.append('confidence_score', 95);
formData.append('duration_ms', 3500);
formData.append('word_count', 8);
formData.append('timestamp', '2025-10-10T19:30:00Z');
formData.append('timezone', 'Europe/Rome');
formData.append('metadata', JSON.stringify({
  staff_id: 123,
  venue_id: 456,
  app_version: '1.0.0',
  platform: 'ios'
}));

// Optional - client-side extracted tokens
formData.append('extracted_tokens', JSON.stringify({
  party_size: 4,
  time_slot: '20:00',
  customer_names: ['Mario', 'Rossi']
}));

const response = await fetch('/voice-intents/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Request (Low Confidence - With Audio):**
```javascript
const formData = new FormData();
formData.append('transcript', 'tavolo per... alle...');
formData.append('locale', 'it-IT');
formData.append('confidence_score', 55);
formData.append('needs_server_recheck', true);
formData.append('audio_file', audioBlob, 'recording.m4a');
// ... other fields same as above

const response = await fetch('/voice-intents/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response (Success - Booking Created):**
```json
{
  "status": "success",
  "intent_id": "intent_abc123",
  "booking_id": 12345,
  "booking": {
    "id": 12345,
    "restaurant_id": 456,
    "table_ids": [12],
    "type": "booking",
    "name": "Mario",
    "surname": "Rossi",
    "phone": null,
    "email": null,
    "arrival_time": "20:00:00",
    "departure_time": "21:30:00",
    "status": "pending",
    "reservation_date": "2025-10-10",
    "adults": 4,
    "children": 0,
    "restaurant_notes": "Voice booking - AI extracted",
    "date_created": "2025-10-10T19:30:00Z"
  },
  "parsed_booking": {
    "party_size": 4,
    "booking_time": "2025-10-10T20:00:00Z",
    "customer_name": "Mario Rossi",
    "confidence": 95
  },
  "server_transcript": null,
  "server_confidence": null,
  "message": "Booking created successfully. Please review and confirm."
}
```

**Response (Needs Clarification - No Booking Created):**
```json
{
  "status": "needs_clarification",
  "intent_id": "intent_abc123",
  "booking_id": null,
  "booking": null,
  "parsed_booking": {
    "party_size": 4,
    "booking_time": "2025-10-10T20:00:00Z",
    "customer_name": null
  },
  "clarifications_needed": [
    {
      "field": "customer_name",
      "message": "Could you provide the customer's name?",
      "suggestions": []
    }
  ],
  "message": "Missing required information. Please provide customer name."
}
```

**Response (Error - No Tables Available):**
```json
{
  "status": "error",
  "intent_id": "intent_abc123",
  "booking_id": null,
  "error_code": "NO_TABLES_AVAILABLE",
  "message": "No available tables for the requested time.",
  "details": "All tables are booked for 4 guests at 20:00 on 2025-10-10.",
  "parsed_booking": {
    "party_size": 4,
    "booking_time": "2025-10-10T20:00:00Z",
    "customer_name": "Mario Rossi"
  },
  "suggested_alternatives": [
    {"time": "19:30:00", "available": true},
    {"time": "20:30:00", "available": true}
  ]
}
```

### 2. Confirm Booking (Update Status)

**Endpoint:** `PATCH /booking/{booking_id}`

**Request:**
```javascript
const response = await fetch(`/booking/${bookingId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'confirmed',
    // Optional: Edit any fields the AI got wrong
    name: 'Mario',
    surname: 'Rossi',
    phone: '+39123456789',
    email: 'mario@example.com',
    adults: 4,
    children: 0,
    restaurant_notes: 'Voice booking - confirmed by staff'
  })
});
```

**Response:**
```json
{
  "id": 12345,
  "status": "confirmed",
  "name": "Mario",
  "surname": "Rossi",
  "phone": "+39123456789",
  // ... full booking object
}
```

### 3. Cancel Booking

**Endpoint:** `DELETE /booking/{booking_id}`

**Request:**
```javascript
const response = await fetch(`/booking/${bookingId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Alternative (Soft Delete):**
```javascript
const response = await fetch(`/booking/${bookingId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'cancelled_by_restaurant'
  })
});
```

## Frontend Implementation

### 1. Voice Recording Service

```javascript
// services/voiceApi.js
export const submitVoiceIntent = async (data) => {
  const formData = new FormData();
  
  // Required fields
  formData.append('transcript', data.transcript);
  formData.append('locale', data.locale);
  formData.append('confidence_score', data.confidence_score);
  formData.append('duration_ms', data.duration_ms);
  formData.append('word_count', data.word_count);
  formData.append('timestamp', data.timestamp);
  formData.append('timezone', data.timezone);
  formData.append('metadata', JSON.stringify(data.metadata));
  
  // Optional fields
  if (data.extracted_tokens) {
    formData.append('extracted_tokens', JSON.stringify(data.extracted_tokens));
  }
  if (data.validation) {
    formData.append('validation', JSON.stringify(data.validation));
  }
  if (data.needs_server_recheck) {
    formData.append('needs_server_recheck', data.needs_server_recheck);
  }
  if (data.audio_file) {
    formData.append('audio_file', data.audio_file);
  }
  
  const response = await fetch('/voice-intents/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to process voice intent');
  }
  
  return response.json();
};

export const confirmBooking = async (bookingId, updates) => {
  const response = await fetch(`/booking/${bookingId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'confirmed',
      ...updates
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to confirm booking');
  }
  
  return response.json();
};

export const cancelBooking = async (bookingId) => {
  const response = await fetch(`/booking/${bookingId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to cancel booking');
  }
  
  return response.json();
};
```

### 2. React Component Example

```jsx
import { useState } from 'react';
import { submitVoiceIntent, confirmBooking, cancelBooking } from './services/voiceApi';

function VoiceBookingModal({ transcript, confidence, audioFile, onClose }) {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitVoiceIntent({
        transcript,
        locale: 'it-IT',
        confidence_score: confidence,
        duration_ms: 3500,
        word_count: transcript.split(' ').length,
        timestamp: new Date().toISOString(),
        timezone: 'Europe/Rome',
        metadata: {
          staff_id: currentUser.id,
          venue_id: currentRestaurant.id,
          app_version: '1.0.0',
          platform: 'web'
        },
        needs_server_recheck: confidence < 70,
        audio_file: confidence < 70 ? audioFile : null
      });
      
      if (result.status === 'success' && result.booking_id) {
        // Booking was created!
        setBooking(result.booking);
      } else if (result.status === 'needs_clarification') {
        // Show form to fill missing fields
        setError('Missing information: ' + 
          result.clarifications_needed.map(c => c.message).join(', '));
      } else if (result.status === 'error') {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to process voice booking');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirm = async (editedData) => {
    setLoading(true);
    try {
      await confirmBooking(booking.id, editedData);
      onClose(true); // Success!
    } catch (err) {
      setError('Failed to confirm booking');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelBooking(booking.id);
      onClose(false);
    } catch (err) {
      setError('Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal">
      {!booking ? (
        <div>
          <h2>Processing Voice Booking...</h2>
          <p>Transcript: {transcript}</p>
          <button onClick={handleSubmit} disabled={loading}>
            Create Booking
          </button>
        </div>
      ) : (
        <div>
          <h2>Review Booking (Status: {booking.status})</h2>
          <BookingForm 
            initialData={booking}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Response Status Handling

```javascript
const handleVoiceIntentResponse = (response) => {
  switch (response.status) {
    case 'success':
      if (response.booking_id) {
        // Booking was created! Show confirmation modal
        showBookingConfirmationModal(response.booking);
      }
      break;
      
    case 'needs_clarification':
      // Show form to fill missing fields
      showClarificationForm(response.clarifications_needed, response.parsed_booking);
      break;
      
    case 'error':
      if (response.error_code === 'NO_TABLES_AVAILABLE') {
        // Show alternative time slots
        showAlternativeTimesModal(response.suggested_alternatives);
      } else {
        // Show error message
        showError(response.message);
      }
      break;
  }
};
```

## Required Fields for Booking Creation

The backend will **only create a booking** if these fields are successfully extracted:

- ✅ `party_size` (adults count)
- ✅ `booking_time` (time)
- ✅ `booking_date` (date - defaults to today if not specified)
- ✅ `customer_name` (at least first name)

**Optional fields** (can be added by staff during confirmation):
- Phone number
- Email
- Children count
- Special requests

## Error Handling

```javascript
try {
  const result = await submitVoiceIntent(data);
  // Handle result
} catch (error) {
  if (error.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.status === 403) {
    // Forbidden - user doesn't have access to this restaurant
  } else if (error.status === 404) {
    // Restaurant not found
  } else if (error.status === 500) {
    // Server error - show retry option
  }
}
```

## Testing

### Test Cases

1. **High confidence, all fields present** → Should create booking immediately
2. **Low confidence with audio** → Should re-transcribe and create booking
3. **Missing customer name** → Should return clarifications_needed
4. **No tables available** → Should return error with alternatives
5. **Invalid restaurant** → Should return 404 error

### Example Test Data

```javascript
// Success case
const testData = {
  transcript: 'Tavolo per 4 alle 20:00 per Mario Rossi',
  locale: 'it-IT',
  confidence_score: 95,
  // ... other fields
};

// Missing name case
const testData2 = {
  transcript: 'Tavolo per 4 alle 20:00',
  locale: 'it-IT',
  confidence_score: 90,
  // ... other fields
};
```

## Notes

- All timestamps should be in ISO 8601 format
- Timezone should be IANA timezone (e.g., 'Europe/Rome')
- Audio files should be m4a, mp3, or wav format
- Max audio file size: 10MB (recommended)
- Booking status flow: `pending` → `confirmed` (or `cancelled_by_restaurant`)
