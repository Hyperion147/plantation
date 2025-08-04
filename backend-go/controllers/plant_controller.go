package controllers

import (
    "net/http"
    "github.com/Hyperion147/plantation/backend-go/models"
    "time"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func AddPlant(c *gin.Context, db *gorm.DB) {
    var input struct {
        Name           string    `json:"name" binding:"required"`
        Description    string    `json:"description"`
        PlantationDate string    `json:"plantation_date"` // ISO8601 string
        Latitude       float64   `json:"latitude" binding:"required"`
        Longitude      float64   `json:"longitude" binding:"required"`
        Type           string    `json:"type"`
        Info           string    `json:"info"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    userID := c.MustGet("userID").(uint)

    var pDate time.Time
    var err error
    if input.PlantationDate != "" {
        pDate, err = time.Parse(time.RFC3339, input.PlantationDate)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use ISO8601"})
            return
        }
    }

    plant := models.Plant{
        UserID:         userID,
        Name:           input.Name,
        Description:    input.Description,
        PlantationDate: pDate,
        Latitude:       input.Latitude,
        Longitude:      input.Longitude,
        Type:           input.Type,
        Info:           input.Info,
    }

    if err := db.Create(&plant).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create plant"})
        return
    }

    c.JSON(http.StatusCreated, plant)
}

func GetPlants(c *gin.Context, db *gorm.DB) {
    userID := c.MustGet("userID").(uint)
    var plants []models.Plant
    if err := db.Where("user_id = ?", userID).Find(&plants).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    }
    c.JSON(http.StatusOK, plants)
}
