package routes

import (
    "github.com/Hyperion147/plantation/backend-go/controllers"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func PlantRoutes(rg *gin.RouterGroup, db *gorm.DB) {
    rg.POST("/", func(c *gin.Context) {
        controllers.AddPlant(c, db)
    })
    rg.GET("/", func(c *gin.Context) {
        controllers.GetPlants(c, db)
    })
}
