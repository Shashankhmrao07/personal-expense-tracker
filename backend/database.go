package main

import (
	"database/sql"
	"log"

	// This is the pure Go driver (no GCC needed!)
	_ "modernc.org/sqlite"
)

var db *sql.DB

func initDB() {
	var err error
	// Note: The driver name here is "sqlite", not "sqlite3"
	db, err = sql.Open("sqlite", "./expenses.db")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	query := `CREATE TABLE IF NOT EXISTS expenses (
		id TEXT PRIMARY KEY,
		amount INTEGER,
		category TEXT,
		description TEXT,
		date TEXT,
		created_at TEXT
	);`

	_, err = db.Exec(query)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}
}