# Cell Traceability System

A comprehensive manufacturing cell traceability system that ensures 100% traceability of cells fitted into kits during the manufacturing process.

## 🎯 Objective

- Ensure each kit has a unique serial number (barcode)
- Allocate exactly 16 cells (or configurable number) to each kit
- Map cells to kits at warehouse issuance
- Validate cell installation at manufacturing line
- Prevent wrong cell installation
- Provide complete audit trail and reporting

## 🏗️ System Architecture

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- RESTful API endpoints
- Real-time validation logic

### Frontend
- **React.js** with modern hooks
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Toastify** for notifications

## 🚀 Features

### 1. Warehouse Allocation
- Allocate cells to kits with unique serial numbers
- Barcode scanning support for kit and cell serial numbers
- Real-time validation and error handling
- Operator tracking and audit logging

### 2. Manufacturing Validation
- Start validation sessions for specific kits
- Real-time cell scanning and validation
- Visual progress tracking with color-coded feedback
- Success/error indicators for each scanned cell
- Session completion tracking

### 3. Kit Management
- View all allocated kits
- Search and filter functionality
- Detailed kit information display
- Cell allocation overview

### 4. Reports & Analytics
- Validation session history
- Success rate tracking
- Operator performance metrics
- Export functionality for reports
- Real-time statistics dashboard

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Modern web browser with JavaScript enabled

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cell-traceability-system
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Start the Application

#### Development Mode (Recommended)
```bash
# Start both server and client in development mode
npm run dev
```

#### Production Mode
```bash
# Build the client
npm run build

# Start the server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📖 Usage Guide

### Warehouse Process

1. **Navigate to Warehouse Tab**
   - Click on "Warehouse" in the navigation menu

2. **Allocate Kit**
   - Enter Kit Serial Number (scan barcode or type manually)
   - Enter Operator Name
   - Add Cell Serial Numbers (scan or type each cell)
   - Click "Allocate Kit" to save

3. **Validation**
   - System validates unique kit serial numbers
   - Prevents duplicate cell allocations
   - Provides real-time feedback

### Manufacturing Process

1. **Start Validation Session**
   - Navigate to "Manufacturing" tab
   - Enter Kit Serial Number
   - Enter Operator Name
   - Click "Start Session"

2. **Scan Cells**
   - System displays expected cells for the kit
   - Scan each cell barcode
   - Real-time validation feedback:
     - ✅ Green: Cell belongs to kit
     - ❌ Red: Cell doesn't belong to kit

3. **Complete Session**
   - All cells must be validated successfully
   - Click "Complete" to finish session
   - Session data is logged for audit trail

### Kit Management

1. **View All Kits**
   - Navigate to "Kit Management" tab
   - Browse all allocated kits
   - Use search functionality to find specific kits

2. **View Kit Details**
   - Click "View Details" for any kit
   - See complete cell allocation
   - View creation and update timestamps

### Reports

1. **View Validation History**
   - Navigate to "Reports" tab
   - See summary statistics
   - Browse all validation sessions

2. **Export Reports**
   - Click "Export" for any session
   - Download JSON report with complete session data

## 🔧 API Endpoints

### Kits
- `POST /api/kits` - Create new kit with allocated cells
- `GET /api/kits` - Get all kits
- `GET /api/kits/:kitSerialNumber` - Get specific kit details

### Validation
- `POST /api/validation/start` - Start validation session
- `POST /api/validation/scan` - Validate cell scan
- `POST /api/validation/complete` - Complete validation session
- `GET /api/validation/:sessionId` - Get session details

## 🗄️ Database Schema

### Tables
1. **kits** - Kit information and metadata
2. **cells** - Cell serial numbers and kit associations
3. **validation_sessions** - Validation session tracking
4. **validation_logs** - Individual cell scan logs

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Helmet.js security headers
- Audit logging for all operations

## 📱 Barcode Integration

The system supports barcode scanning through:
- Manual input (for testing)
- Web-based barcode scanners
- Mobile device cameras
- Physical barcode scanners

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Feedback**: Immediate validation results
- **Color-coded Status**: Green for success, red for errors
- **Progress Tracking**: Visual progress bars and counters
- **Toast Notifications**: User-friendly success/error messages
- **Loading States**: Clear indication of processing status

## 🔄 Process Flow

```
Warehouse → Kit Allocation → Manufacturing → Validation → Reports
    ↓              ↓              ↓              ↓           ↓
  Scan Kit    Allocate 16    Start Session   Scan Cells   View History
  Serial #      Cells       Enter Operator   Validate     Export Data
```

## 🚨 Error Handling

- **Duplicate Kit Serial Numbers**: Prevented at allocation
- **Invalid Cell Scans**: Real-time validation and feedback
- **Session Management**: Proper session state handling
- **Network Errors**: Graceful error handling with user feedback

## 📊 Reporting Features

- **Session Statistics**: Duration, success rate, operator performance
- **Kit Overview**: Complete cell allocation history
- **Export Functionality**: JSON reports for external analysis
- **Real-time Dashboard**: Live statistics and metrics

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### Database
- SQLite database file: `traceability.db`
- Auto-created on first run
- Includes all necessary tables and indexes

## 🧪 Testing

### Manual Testing
1. Create test kits with sample serial numbers
2. Allocate test cells to kits
3. Perform validation sessions
4. Verify audit trail and reports

### Sample Data
- Kit Serial Numbers: `KIT-2024-001`, `KIT-2024-002`, etc.
- Cell Serial Numbers: `CELL-001`, `CELL-002`, etc.
- Operator Names: `John Smith`, `Jane Doe`, etc.

## 🚀 Deployment

### Production Setup
1. Build the React application: `npm run build`
2. Set environment variables
3. Start the server: `npm start`
4. Configure reverse proxy (nginx/Apache) if needed

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 📞 Support

For technical support or feature requests:
- Check the documentation
- Review error logs
- Contact the development team

## 📄 License

This project is licensed under the MIT License.

---

**Cell Traceability System** - Ensuring manufacturing quality through complete traceability.
