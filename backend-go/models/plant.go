package models

import (
	"time"
)

type Plant struct {
    ID             uint      `gorm:"primaryKey"`
    UserID         uint      `gorm:"not null"`
    Name           string    `gorm:"not null"`
    Description    string
    PlantationDate time.Time
    Latitude       float64   `gorm:"not null"`
    Longitude      float64   `gorm:"not null"`
    Type           string
    Info           string
    CreatedAt      time.Time
}
