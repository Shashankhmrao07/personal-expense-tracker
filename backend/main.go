package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

// enableCORS is a middleware to allow React to talk to this API
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func main() {
	initDB() // This is defined in database.go
	defer db.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Expense Tracker API is running!")
	})

	http.HandleFunc("/expenses", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			getExpenses(w, r) // Defined in handlers.go
		} else if r.Method == "POST" {
			createExpense(w, r) // Defined in handlers.go
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	fmt.Println("Backend server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
