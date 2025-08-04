package main

import (
	"log"
	"plantation/backend-go/config"
	"plantation/backend-go/middleware"
	"plantation/backend-go/routes"

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
