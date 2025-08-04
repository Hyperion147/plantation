package config

import (
    "fmt"
    "log"
    "os"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "github.com/Hyperion147/plantation/backend-go/models"
    "github.com/joho/godotenv"
)

func SetupDatabase() *gorm.DB {
    err := godotenv.Load()
    if err != nil {
        log.Println("No .env file found, relying on env vars")
    }

    dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
        os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASS"),
        os.Getenv("DB_NAME"), os.Getenv("DB_PORT"))

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
        return nil
    }

    // Auto migrate tables
    err = db.AutoMigrate(&models.User{}, &models.Plant{})
    if err != nil {
        log.Fatalf("AutoMigrate failed: %v", err)
        return nil
    }

    return db
}
