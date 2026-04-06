package handler

import (
	"net/http"
	"time"

	"mobile_verifier/internal/svc"
	"mobile_verifier/model"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// GenerateBearerHandler simulates an external login portal.
// NOTE: This handler is for DEVELOPMENT ONLY to provide a valid Bearer Token for testing workflows.
func GenerateBearerHandler(svcCtx *svc.ServiceContext) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Phone  string `json:"phone" binding:"required"`
			GameID string `json:"game_id" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Phone number and Game ID are required to generate a bearer token.",
			})
			return
		}

		var user model.User

		// Query the database for an existing record matching both the provided phone number and game ID.
		result := svcCtx.DB.Where("phone = ? AND game_id = ?", req.Phone, req.GameID).First(&user)

		if result.Error != nil {
			// If no exact match is found, create a new record.
			// This handles both completely new numbers and existing numbers logging into a new game.
			user = model.User{
				Phone:        req.Phone,
				GameID:       req.GameID,
				OTPExpiresAt: time.Now(),
			}

			if err := svcCtx.DB.Create(&user).Error; err != nil {
				c.JSON(http.StatusConflict, gin.H{
					"error": "Failed to create user record.",
				})
				return
			}
		}

		// Generate a standard JWT (Bearer Token) using the application's configured secret key.
		claims := jwt.MapClaims{
			"user_id": user.ID, // Bind the token to this specific user and game profile context.
			"exp":     time.Now().Add(time.Duration(svcCtx.Config.Auth.AccessExpire) * time.Second).Unix(),
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString([]byte(svcCtx.Config.Auth.AccessSecret))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token."})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":      "TEST BEARER TOKEN GENERATED SUCCESSFULLY",
			"bearer_token": tokenString,
			"phone":        user.Phone,
			"game_id":      user.GameID,
		})
	}
}
