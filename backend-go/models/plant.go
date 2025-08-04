package models

import (
    "time"
    "gorm.io/gorm"
)

type Plant struct {
    gorm.Model
    UserID         uint      `gorm:"not null"`
    Name           string    `gorm:"not null"`
    Description    string
    PlantationDate time.Time
    Latitude       float64   `gorm:"not null"`
    Longitude      float64   `gorm:"not null"`
    Type           string
    Info           string
}
