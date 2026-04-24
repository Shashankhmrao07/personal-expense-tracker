package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestGetExpenses verifies that the GET endpoint returns a 200 OK and JSON
func TestGetExpenses(t *testing.T) {
	// Initialize the DB for the test environment
	initDB()

	req, err := http.NewRequest("GET", "/expenses", nil)
	if err != nil {
		t.Fatal(err)
	}

	// We use httptest to record the response without starting a real server
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getExpenses)

	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Verify content type is JSON
	expectedType := "application/json"
	if contentType := rr.Header().Get("Content-Type"); contentType != expectedType {
		t.Errorf("handler returned wrong content type: got %v want %v",
			contentType, expectedType)
	}
}

// TestCreateExpense verifies that sending a valid expense returns 201 Created
func TestCreateExpense(t *testing.T) {
	initDB()

	// Create a mock expense payload
	payload := Expense{
		Amount:      5000, // $50.00
		Category:    "Food",
		Description: "Test Expense",
		Date:        "2026-04-24",
	}
	body, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", "/expenses", bytes.NewBuffer(body))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(createExpense)

	handler.ServeHTTP(rr, req)

	// Check status code (201 Created)
	if status := rr.Code; status != http.StatusCreated {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusCreated)
	}

	// Verify the response contains our unique ID
	var response Expense
	json.Unmarshal(rr.Body.Bytes(), &response)
	if response.ID == "" {
		t.Errorf("handler did not return a valid UUID")
	}
}
