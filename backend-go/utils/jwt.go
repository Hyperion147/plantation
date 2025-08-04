package utils

import (
    "os"
    "time"
    "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func GenerateJWT(userID uint) (string, error) {
    claims := jwt.MapClaims{
        "userID": userID,
        "exp":    time.Now().Add(time.Hour * 72).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

func ParseToken(tokenStr string) (uint, error) {
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })

    if err != nil || !token.Valid {
        return 0, err
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok || claims["userID"] == nil {
        return 0, err
    }

    userIDFloat, ok := claims["userID"].(float64)
    if !ok {
        return 0, err
    }

    return uint(userIDFloat), nil
}
