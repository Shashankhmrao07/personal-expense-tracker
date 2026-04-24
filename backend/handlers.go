package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// Expense struct updated to match your handler's requirements
type Expense struct {
	ID          string `json:"id"`
	Amount      int64  `json:"amount"` // Matches int64 from requests
	Category    string `json:"category"`
	Description string `json:"description"`
	Date        string `json:"date"`
	CreatedAt   string `json:"created_at"` // Added missing field
}

// getExpenses handles fetching and filtering data
func getExpenses(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	sort := r.URL.Query().Get("sort")

	query := "SELECT id, amount, category, description, date, created_at FROM expenses"
	var args []interface{}

	if category != "" {
		query += " WHERE category = ?"
		args = append(args, category)
	}

	if sort == "date_desc" {
		query += " ORDER BY date DESC"
	} else {
		query += " ORDER BY date ASC"
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var expenses []Expense
	for rows.Next() {
		var e Expense
		// We now scan 6 fields including created_at
		err := rows.Scan(&e.ID, &e.Amount, &e.Category, &e.Description, &e.Date, &e.CreatedAt)
		if err != nil {
			continue
		}
		expenses = append(expenses, e)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(expenses)
}

// createExpense handles validation and saving
func createExpense(w http.ResponseWriter, r *http.Request) {
	var req Expense
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// 1. Validation
	if req.Amount <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Amount must be greater than zero"})
		return
	}

	// 2. Prepare the new Expense object
	newExpense := Expense{
		ID:          uuid.New().String(),
		Amount:      req.Amount, // Now correctly handles int64
		Category:    req.Category,
		Description: req.Description,
		Date:        req.Date,
		CreatedAt:   time.Now().Format(time.RFC3339), // Converts time.Time to string
	}

	// 3. Save to Database
	stmt, err := db.Prepare("INSERT INTO expenses (id, amount, category, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		http.Error(w, "Database preparation failed", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(newExpense.ID, newExpense.Amount, newExpense.Category, newExpense.Description, newExpense.Date, newExpense.CreatedAt)
	if err != nil {
		http.Error(w, "Failed to save expense", http.StatusInternalServerError)
		return
	}

	// 4. Return the created object
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newExpense)
}
