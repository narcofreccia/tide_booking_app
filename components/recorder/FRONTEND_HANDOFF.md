# 📋 Frontend Team Handoff - Voice Booking Feature

## 🎯 What to Share with Frontend Team

### **Main Document**
👉 **`FRONTEND_INTEGRATION.md`** - Complete integration guide with:
- API endpoint documentation
- Request/response examples
- React component examples
- Error handling guide
- Testing examples

### **Additional Reference Documents**
- `VOICE_BOOKING_FLOW.md` - Complete backend flow diagram
- `TEST_ENDPOINT.md` - Testing guide with cURL examples
- `TEST_AI_EXTRACTION.md` - AI extraction examples in multiple languages

---

## 📝 Quick Summary for Frontend Team

### What's Ready
✅ **Endpoint**: `POST /voice-intents/`
✅ **Authentication**: Requires Bearer token (same as other endpoints)
✅ **AI Extraction**: Automatic extraction from transcript (any language)
✅ **Booking Creation**: Creates PENDING bookings automatically
✅ **Confirmation Flow**: Uses existing `PATCH /booking/{id}` endpoint

### What Frontend Needs to Do

1. **Send transcript to backend**
   - Multipart form data
   - Include metadata (staff_id, venue_id)
   - Optional: audio file for low confidence

2. **Handle 3 response types**:
   - ✅ **Success** → Show booking confirmation modal
   - ⚠️ **Needs Clarification** → Show form to fill missing fields
   - ❌ **Error** → Show error message

3. **Staff confirmation**:
   - Staff reviews booking details
   - Can edit any field
   - Clicks "Confirm" → `PATCH /booking/{id}` with `status: "confirmed"`
   - Or clicks "Cancel" → `DELETE /booking/{id}`

---

## 🔑 Key Points

### 1. Booking is Created Immediately
- ✅ Backend creates booking with `status="pending"` if all required fields present
- ✅ Frontend receives `booking_id` in response
- ✅ Staff MUST confirm or cancel

### 2. Required Fields (for booking creation)
- `party_size` (number of guests)
- `time` (booking time)
- `customer_name` (at least first name)

### 3. Optional Fields (can be added during confirmation)
- `phone` (phone number)
- `email` (email address)
- `children` (number of children)
- `highchair_number` (number of highchairs)
- `wheelchair_number` (wheelchair accessibility)
- `special_requests` (allergies, preferences)

### 4. AI Capabilities
The AI automatically handles:
- ✅ **Multiple languages**: Italian, English, French, German, Spanish, etc.
- ✅ **Relative dates**: "domani" → tomorrow's date, "stasera" → today
- ✅ **Time conversion**: "8pm" → "20:00"
- ✅ **Adults/children**: "2 adulti e 1 bambino" → adults=2, children=1
- ✅ **Special needs**: "serve un seggiolone" → highchair_number=1

---

## 📊 Response Examples

### Success Response (Booking Created)
```json
{
  "status": "success",
  "booking_id": 12345,
  "booking": {
    "id": 12345,
    "name": "Mario",
    "surname": "Rossi",
    "adults": 4,
    "children": 0,
    "arrival_time": "20:00:00",
    "reservation_date": "2025-10-10",
    "status": "pending",
    "restaurant_notes": "Voice booking - AI extracted (confidence: 95%)"
  },
  "message": "Booking created successfully. Please review and confirm."
}
```

### Needs Clarification (No Booking Created)
```json
{
  "status": "needs_clarification",
  "booking_id": null,
  "clarifications_needed": [
    {
      "field": "customer_name",
      "message": "Could you provide the customer's name?"
    }
  ],
  "message": "Missing required information."
}
```

---

## 🧪 Testing

### Quick Test (cURL)
```bash
curl -X POST "http://localhost:8000/voice-intents/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "transcript=Tavolo per 4 alle 20:00 per Mario Rossi" \
  -F "locale=it-IT" \
  -F "confidence_score=95" \
  -F "duration_ms=3500" \
  -F "word_count=8" \
  -F "timestamp=2025-10-10T19:30:00Z" \
  -F "timezone=Europe/Rome" \
  -F 'metadata={"staff_id":1,"venue_id":1}'
```

### Test Transcripts
Try these in different languages:

**Italian:**
- "Tavolo per 4 alle 20:00 per Mario Rossi"
- "Prenotazione per domani sera alle 19:30, 2 adulti e 1 bambino, serve un seggiolone"

**English:**
- "Table for 6 tonight at 8pm for John Smith"
- "Reservation for 4 tomorrow at 7:30pm for Sarah Johnson"

**French:**
- "Réservation pour 4 personnes demain à 19h30 au nom de Pierre Dubois"

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. Staff speaks into microphone                         │
│    "Tavolo per 4 alle 20:00 per Mario Rossi"           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend sends to POST /voice-intents/               │
│    - transcript                                          │
│    - locale, timezone                                    │
│    - metadata (staff_id, venue_id)                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Backend AI extracts information                       │
│    - party_size: 4                                       │
│    - time: "20:00"                                       │
│    - customer_name: "Mario Rossi"                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Backend creates PENDING booking                       │
│    - Checks table availability                           │
│    - Creates booking with status="pending"              │
│    - Returns booking_id + booking object                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Frontend shows confirmation modal                     │
│    - Display booking details                             │
│    - Allow staff to edit fields                          │
│    - "Confirm" or "Cancel" buttons                      │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌──────────────────┐              ┌──────────────────┐
│ Staff Confirms   │              │ Staff Cancels    │
│                  │              │                  │
│ PATCH /booking/  │              │ DELETE /booking/ │
│ {id}             │              │ {id}             │
│                  │              │                  │
│ status:          │              │                  │
│ "confirmed"      │              │                  │
└──────────────────┘              └──────────────────┘
```

---

## 📞 Questions?

If frontend team has questions:
1. Check `FRONTEND_INTEGRATION.md` for detailed examples
2. Check `TEST_ENDPOINT.md` for testing guide
3. Check server logs for debugging
4. Test with cURL first to verify backend behavior

---

## ✅ Checklist for Frontend Team

- [ ] Read `FRONTEND_INTEGRATION.md`
- [ ] Test endpoint with cURL
- [ ] Implement `submitVoiceIntent()` function
- [ ] Handle success response (show confirmation modal)
- [ ] Handle needs_clarification response (show form)
- [ ] Handle error response (show error message)
- [ ] Implement confirmation flow (PATCH /booking/{id})
- [ ] Implement cancellation flow (DELETE /booking/{id})
- [ ] Test with various transcripts in different languages
- [ ] Test error cases (missing fields, no tables available)

---

## 🎉 Ready to Go!

The backend is **fully functional** and ready for frontend integration. The AI extraction works great with real transcripts in multiple languages!
