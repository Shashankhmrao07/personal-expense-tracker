# Personal Expense Tracker

A full-stack application built to track and categorize daily expenses. This project focuses on type safety, clean API design, and a seamless developer experience by avoiding complex environmental dependencies.

## Technical Stack

* **Backend:** Go (Golang)
* **Database:** SQLite (using a pure-Go driver for CGO-free portability)
* **Frontend:** React with TypeScript (Vite-based)
* **Communication:** RESTful API with CORS enabled for local development

## Key Features & Implementation Details

* **Data Persistence:** Uses SQLite for local storage. The `modernc.org/sqlite` driver was selected to ensure the backend remains portable across different environments without requiring a C compiler (GCC).
* **Financial Accuracy:** All currency amounts are handled as **integers (cents)** throughout the system. This avoids the precision issues inherent in floating-point math for financial data.
* **Real-time Insights:** Includes a dynamic "Category Totals" summary that recalculates instantly as expenses are added or filtered.
* **Server-Side Filtering:** Category filtering and date sorting are handled via URL query parameters in the Go backend to ensure the UI stays performant.
* **Input Validation:** The backend validates payloads to ensure amounts are positive and required fields are present before database insertion.

## Getting Started

### Prerequisites
* Go 1.21 or higher
* Node.js (v18+) and npm

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    go get .
    ```
3.  Run the server:
    ```bash
    go run .
    ```
    The server will start at `http://localhost:8080`. An `expenses.db` file is created automatically on the first run.

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Launch the development server:
    ```bash
    npm run dev
    ```
    The UI will be available at the URL provided in your terminal (usually `http://localhost:5173`).

## Testing
The backend includes automated unit tests for the API handlers. To run the test suite:
```bash
cd backend
go test -v .