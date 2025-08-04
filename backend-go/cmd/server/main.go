package main

import (
	"log"
	"github.com/Hyperion147/plantation/backend-go/config"
	"github.com/Hyperion147/plantation/backend-go/middleware"
	"github.com/Hyperion147/plantation/backend-go/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize DB
	db := config.SetupDatabase()
	if db == nil {
		log.Fatal("DB connection failed")
	}

	r := gin.Default()

	r.Use(middleware.CORSMiddleware())
	// Public routes
	authRoutes := r.Group("/auth")
	routes.AuthRoutes(authRoutes, db)

	// Protected routes
	plantRoutes := r.Group("/plants")
	plantRoutes.Use(middleware.AuthMiddleware())
	routes.PlantRoutes(plantRoutes, db)

	log.Fatal(r.Run(":8080"))
}
