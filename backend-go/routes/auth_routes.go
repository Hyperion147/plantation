package routes

import (
    "github.com/Hyperion147/plantation/backend-go/controllers"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func AuthRoutes(rg *gin.RouterGroup, db *gorm.DB) {
    rg.POST("/signup", func(c *gin.Context) {
        controllers.Signup(c, db)
    })
    rg.POST("/login", func(c *gin.Context) {
        controllers.Login(c, db)
    })
}
